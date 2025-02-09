require('dotenv').config()
const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
const key = process.env.SECRET_KEY
const iv = process.env.IV_KEY

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return encrypted.toString('hex')
}

const decrypt = (encryptedText) => {
  const encryptedTextBuffer = Buffer.from(encryptedText, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
  let decrypted = decipher.update(encryptedTextBuffer)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

module.exports = {
  encrypt,
  decrypt
}
