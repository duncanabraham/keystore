const bcrypt = require('bcryptjs')
const jsonfile = require('jsonfile')
const path = require('path')
const { decrypt } = require('../lib/crypto-helper')

class KeyStore {
  constructor (secretsFilePath) {
    this.secretsFilePath = path.resolve(__dirname, '..', secretsFilePath)
    this.db = jsonfile.readFileSync(this.secretsFilePath)
  }

  logout () {
    delete this.currentUser
  }

  authenticate (username, password) {
    if (this.db._users && this.db._users[username]) {
      const user = this.db._users[username]
      if (bcrypt.compareSync(password, user.password)) {
        this.currentUser = username
        return true
      }
    }
    return false
  }

  getAllKeys () {
    if (!this.currentUser) {
      return new Error('User not authenticated')
    }

    const userApps = this.db._users[this.currentUser].apps
    const keys = {}

    userApps.forEach(appGuid => {
      if (this.db[appGuid]) {
        keys[appGuid] = {
          name: this.db[appGuid].name,
          keys: {}
        }
        Object.keys(this.db[appGuid].keys).forEach(keyName => {
          const encryptedValue = this.db[appGuid].keys[keyName]
          keys[appGuid].keys[keyName] = decrypt(encryptedValue)
        })
      }
    })

    return keys
  }
}

module.exports = KeyStore
