const jwt = require('jsonwebtoken')

const expectedIPAddress = '127.0.0.1' // always runs on the same server

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Authentication required; token not provided or malformed.')
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid token')
    }

    // Check if the request IP matches the expected IP
    const requestIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']
    if (requestIP !== expectedIPAddress) {
      return res.status(403).send(`Access denied from IP ${requestIP}`)
    }

    req.user = decoded
    next()
  })
}

module.exports = authenticate
