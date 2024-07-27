const jwt = require('jsonwebtoken')

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, username: user.username },
                                process.env.JWT_SECRET,
                                { expiresIn: '1h' })
  
  const refreshToken = jwt.sign({ id: user.id, username: user.username },
                                 process.env.REFRESH_TOKEN_SECRET,
                                 { expiresIn: '24h' })
  
  return { accessToken, refreshToken }
}

module.exports = generateTokens
