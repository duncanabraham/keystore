require('dotenv').config()

const authenticate = (req, res, next) => {
  const apiKey = req.headers['auth-key']
  if (!apiKey || apiKey !== process.env.AUTH_KEY) {
    return res.status(403).json({ error: 'Access denied. Invalid authentication key.' })
  }
  next()
}

module.exports = authenticate
