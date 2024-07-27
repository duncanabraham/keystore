require('dotenv').config()
const https = require('https')
const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile')
const { encrypt, decrypt } = require('./lib/crypto-helper')
const authenticate = require('./lib/auth-middleware')

const loginHandler = require('./lib/login'); 

const { PORT, PEMPATH, DATA_STORE } = process.env

const privateKey = fs.readFileSync(PEMPATH, 'utf8')
const certificate = fs.readFileSync(PEMPATH, 'utf8')

const credentials = { key: privateKey, cert: certificate }

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

// Secure routes with the authentication middleware
app.use(authenticate)

const authorized = (authKey, appKey) => {
  // Implement your logic to check if authKey has access to appKey
  return true; // Example: return true if authorized, false otherwise
}

app.post('/login', (req, res) => {
  const { username, password } = req.body
  loginHandler.login(req, res)
})

// Endpoint to store a key
app.post('/store', (req, res) => {
  const { appKey, key, value } = req.body
  if (!authorized(req.headers['auth-key'], appKey)) {
    return res.status(403).send('Unauthorized access')
  }
  const encryptedValue = encrypt(value)
  const file = DATA_STORE
  jsonfile.readFile(file, (err, obj) => {
    if (err) console.error(err)
    if (!obj[appKey]) {
      obj[appKey] = { name: "Application Name", keys: {} } // Add a default or fetched app name
    }
    obj[appKey].keys[key] = encryptedValue
    jsonfile.writeFile(file, obj, (err) => {
      if (err) console.error(err)
      res.send('Key stored successfully')
    })
  })
})

app.get('/getallkeys', (req, res) => {
  const { appKey } = req.query

  if (!appKey) {
    return res.status(400).send('appKey is required')
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

    // Decrypt and return all keys for the app
    const decryptedKeys = {}
    for (const key in appData.keys) {
      decryptedKeys[key] = decrypt(appData.keys[key])
    }

    res.json(decryptedKeys)
  })
})


// Endpoint to retrieve a key
app.get('/retrieve', (req, res) => {
  const { appKey, key } = req.query
  if (!authorized(req.headers['auth-key'], appKey)) {
    return res.status(403).send('Unauthorized access')
  }
  const file = DATA_STORE
  jsonfile.readFile(file, (err, obj) => {
    if (err) res.status(500).send('Error reading file')
    if (obj[appKey] && obj[appKey].keys[key]) {
      const decryptedValue = decrypt(obj[appKey].keys[key])
      res.send({ [key]: decryptedValue })
    } else {
      res.status(404).send('Key not found')
    }
  })
})

const httpsServer = https.createServer(credentials, app)

httpsServer.listen(PORT, '127.0.0.1', () => {
    console.log(`HTTPS server running on port ${PORT}`)
})
