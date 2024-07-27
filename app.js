require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');
const { decrypt } = require('./lib/crypto-helper');
const authenticate = require('./lib/auth-middleware');
const bcrypt = require('bcryptjs');
const generateToken = require('./lib/generate-token');

const { PORT, PEMPATH, DATA_STORE } = process.env;

const privateKey = fs.readFileSync(PEMPATH, 'utf8');
const certificate = fs.readFileSync(PEMPATH, 'utf8');

const credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(bodyParser.json());

const authorized = (username, appKey) => {
  const db = jsonfile.readFileSync(DATA_STORE);
  if (!db._users || !db._users[username]) {
    console.error('User not found');
    return false;
  }
  return db._users[username].apps.includes(appKey);
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = jsonfile.readFileSync(DATA_STORE);
    if (!db._users || !db._users[username]) {
      return res.status(401).send('No such user found');
    }
    const user = db._users[username];
    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken({ id: username, username });
      return res.json({ token });
    } else {
      return res.status(401).send('Credentials are incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Server error during login');
  }
});

app.post('/refresh_token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).send('Refresh Token is required.');

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Refresh Token');
    const newAccessToken = jwt.sign({ id: user.id, username: user.username },
                                     process.env.JWT_SECRET,
                                     { expiresIn: '1h' });
    res.json({ accessToken: newAccessToken });
  });
});

// Apply the authentication middleware to all routes below this line
app.use(authenticate);

app.get('/getallkeys', (req, res) => {
  const { appKey } = req.query;
  if (!authorized(req.user.username, appKey)) {
    return res.status(403).send('Unauthorized access');
  }
  const file = DATA_STORE;
  jsonfile.readFile(file, (err, obj) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading file');
    }
    const appData = obj[appKey];
    if (!appData) {
      return res.status(404).send('Application not found');
    }
    const decryptedKeys = {};
    for (const key in appData.keys) {
      decryptedKeys[key] = decrypt(appData.keys[key]);
    }
    res.json(decryptedKeys);
  });
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, '127.0.0.1', () => {
    console.log(`HTTPS server running on port ${PORT}`);
});
