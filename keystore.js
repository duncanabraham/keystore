#!/usr/bin/env node
require('dotenv').config()
const crypto = require('crypto')
const { program } = require('commander')
const jsonfile = require('jsonfile')
const { encrypt, decrypt } = require('./lib/crypto-helper')
const bcrypt = require('bcryptjs')

const { DATA_STORE } = process.env

const secretsFilePath = DATA_STORE; // Adjust the path as necessary

program.version('1.0.0', '-v, --version')
  .description('CLI tool for managing encryption keys and applications within a keystore.')

/**
 * User Management
 */
const addUser = (username, password, apps) => {
  const file = DATA_STORE
  const db = jsonfile.readFileSync(file)

  if (db._users && db._users[username]) {
    console.error('User already exists')
    return
  }

  const hashedPassword = bcrypt.hashSync(password, 10)
  db._users = db._users || {}
  db._users[username] = { password: hashedPassword, apps }

  jsonfile.writeFileSync(file, db)
  console.log('User added successfully')
}

const delUser = (username) => {
  const file = DATA_STORE
  const db = jsonfile.readFileSync(file)

  if (!db._users || !db._users[username]) {
    console.error('User not found')
    return
  }

  delete db._users[username]
  jsonfile.writeFileSync(file, db)
  console.log('User deleted successfully')
}

const updateUserPassword = (username, newPassword) => {
  const file = DATA_STORE
  const db = jsonfile.readFileSync(file)

  if (!db._users || !db._users[username]) {
    console.error('User not found')
    return
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10)
  db._users[username].password = hashedPassword
  jsonfile.writeFileSync(file, db)
  console.log('User password updated successfully')
}
/**
 * End User Management
 */

const ignoreApp = (key) => {
  const ignoreList = ['_users']
  return ignoreList.includes(key)
}

// List all applications
const listApplications = () => {
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    console.log('Applications:')
    Object.entries(obj).forEach(([guid, appDetails]) => {
      console.log(`${appDetails.name} (GUID: ${guid})`)
    })
  })
}

// List all keys
const listAllKeys = (appName) => {
  if (ignoreApp(appName)) {
    console.error('invalid application name')
    return
  }
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName)
    if (!appGuid) {
      console.error('Application not found')
      return
    }
    console.log('Keys:')
    Object.keys(obj[appGuid]['keys']).forEach(key => {
      console.log(`  "${key}"`)
    })
  })
}

// Add a new application
const addApplication = (appName) => {
  if (ignoreApp(appName)) {
    console.error('invalid application name')
    return
  }
  const appGuid = crypto.randomUUID()
  const newApp = {
    [appGuid]: { name: appName, keys: {} }
  }
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    obj = { ...obj, ...newApp }
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err)
      console.log(`Added new application: ${appName} (GUID: ${appGuid})`)
    })
  })
}

// Add or update a key for an application
const addOrUpdateKey = (appName, keyName, value) => {
  if (ignoreApp(appName)) {
    console.error('invalid application name')
    return
  }
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    const appEntry = Object.entries(obj).find(([_, details]) => details.name === appName)
    if (!appEntry) {
      console.error('Application not found')
      return
    }
    const [appGuid, appDetails] = appEntry
    appDetails.keys[keyName] = encrypt(value); // Encrypt the value before storing
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err)
      console.log(`Key '${keyName}' updated for application '${appName}'.`)
    })
  })
}

// Subcommand to delete an application
const deleteApplication = (appName) => {
  if (ignoreApp(appName)) {
    console.error('invalid application name')
    return
  }
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName)
    if (!appGuid) {
      console.error('Application not found')
      return
    }
    delete obj[appGuid]
    jsonfile.writeFile(secretsFilePath, obj, (err) => {
      if (err) console.error(err)
      console.log(`Application '${appName}' deleted.`)
    })
  })
}

// Subcommand to delete a key from an application
const deleteKey = (appName, keyName) => {
  if (ignoreApp(appName)) {
    console.error('invalid application name')
    return
  }
  jsonfile.readFile(secretsFilePath, (err, obj) => {
    if (err) return console.error(err)
    const appGuid = Object.keys(obj).find(key => obj[key].name === appName)
    if (!appGuid) {
      console.error('Application not found')
      return
    }
    if (obj[appGuid].keys[keyName]) {
      delete obj[appGuid].keys[keyName]
      jsonfile.writeFile(secretsFilePath, obj, (err) => {
        if (err) console.error(err)
        console.log(`Key '${keyName}' deleted from '${appName}'.`)
      })
    } else {
      console.log('Key not found.')
    }
  })
}

// Define commands with detailed descriptions
program
  .command('list')
  .description('list all applications and their app codes')
  .action(listApplications)

program
  .command('listkeys <app_name>')
  .description('list all keys for a given application')
  .action(listAllKeys)

program
  .command('addapp <app_name>')
  .description('add a new application with a unique GUID')
  .action(addApplication)

program
  .command('addkey <app_name> <key_name> <value>')
  .description('add or update a key for a specified application')
  .action(addOrUpdateKey)

program
  .command('delapp <app_name>')
  .description('delete a specified application by name')
  .action(deleteApplication)

program
  .command('delkey <app_name> <key_name>')
  .description('delete a specified key from an application')
  .action(deleteKey)

program
  .command('adduser <username> <password> <apps...>')
  .description('Add a new user with access to specified apps')
  .action(addUser)
  .on('--help', () => {
    console.log('')
    console.log('Example:')
    console.log('  $ keystore.js adduser john doe123 app1 app2')
  })

program
  .command('deluser <username>')
  .description('Delete a user')
  .action(delUser)

program
  .command('userpwd <username> <newPassword>')
  .description('Set or reset a user password')
  .action(updateUserPassword)

program.parse(process.argv)
