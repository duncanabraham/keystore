require('dotenv').config()
const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile')
const { decrypt } = require('./lib/crypto-helper')
const authenticate = require('./lib/auth-middleware')
const bcrypt = require('bcryptjs')
const generateToken = require('./lib/generate-token')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const jwt = require('jsonwebtoken')

const { PORT, PEMPATH, DATA_STORE, NODE_ENV } = process.env

const privateKey = fs.readFileSync(PEMPATH, 'utf8')
const certificate = fs.readFileSync(PEMPATH, 'utf8')

const credentials = { key: privateKey, cert: certificate }

const app = express()
app.use(bodyParser.json())

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'A simple API documentation example for KeyStore system'
    },
    servers: [
      {
        url: 'https://localhost:{port}',
        description: 'Development server',
        variables: {
          port: {
            default: `${PORT}`
          }
        }
      }
    ]
  },
  // Specify the file location that includes the API routes
  apis: ['./app.js'] // Adjust this to point to the actual location of your API routes
}

const authorized = (username, appKey) => {
  const db = jsonfile.readFileSync(DATA_STORE)
  if (!db._users || !db._users[username]) {
    console.error('User not found')
    return false
  }
  return db._users[username].apps.includes(appKey)
}

if (NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(swaggerOptions)))
}

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Authenticate users and retrieve a JWT.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT.
 *       401:
 *         description: Authentication failed.
 */
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const db = jsonfile.readFileSync(DATA_STORE)
    if (!db._users || !db._users[username]) {
      return res.status(401).send('No such user found')
    }
    const user = db._users[username]
    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken({ id: username, username })
      return res.json({ token })
    } else {
      return res.status(401).send('Credentials are incorrect')
    }
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).send('Server error during login')
  }
})

app.post('/refresh_token', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).send('Refresh Token is required.')

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Refresh Token')
    const newAccessToken = jwt.sign({ id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' })
    res.json({ accessToken: newAccessToken })
  })
})

// Apply the authentication middleware to all routes below this line
app.use(authenticate)

/**
 * @openapi
 * /getallkeys:
 *   get:
 *     summary: Retrieve all keys for an application.
 *     tags: [Keys Management]
 *     parameters:
 *       - in: query
 *         name: appKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the application.
 *     responses:
 *       200:
 *         description: Returns all keys for the specified application.
 *       403:
 *         description: Unauthorized access.
 *       404:
 *         description: Application not found.
 */
app.get('/getallkeys', (req, res) => {
  const { appKey } = req.query
  if (!authorized(req.user.username, appKey)) {
    return res.status(403).send('Unauthorized access')
  }
  const file = DATA_STORE
  jsonfile.readFile(file, (err, obj) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Error reading file')
    }
    const appData = obj[appKey]
    if (!appData) {
      return res.status(404).send('Application not found')
    }
    const decryptedKeys = {}
    for (const key in appData.keys) {
      decryptedKeys[key] = decrypt(appData.keys[key])
    }
    res.json(decryptedKeys)
  })
})

const httpsServer = https.createServer(credentials, app)

httpsServer.listen(PORT, '127.0.0.1', () => {
  console.log(`HTTPS server running on port ${PORT}`)
})
