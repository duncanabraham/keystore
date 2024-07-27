const bcrypt = require('bcryptjs');
const generateToken = require('./generateToken');

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Dummy user lookup; replace with your database lookup
    const user = { id: 1, username: 'test', passwordHash: bcrypt.hashSync('pass123', 10) };

    // Verify password and generate token
    if (bcrypt.compareSync(password, user.passwordHash)) {
        const token = generateToken(user);
        return res.json({ token });
    }

    return res.status(401).send('Credentials are incorrect');
});
