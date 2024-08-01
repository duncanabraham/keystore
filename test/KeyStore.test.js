/* global describe, it */

/**
To make this work you need to:
1) create a user "john" with a password of "password123"
2) create an app called "App One"
3) add a key called key1 with a value of your choice
4) update the GUIDs in this test to match your secrets.json file
*/

const chai = require('chai')

const expect = chai.expect
const KeyStore = require('../modules/KeyStore')

const keyStore = new KeyStore('./secrets.json')

describe('KeyStore Class', () => {
  it('should authenticate a user with correct credentials', () => {
    const isAuthenticated = keyStore.authenticate('john', 'password123')
    expect(isAuthenticated).to.equal(true)
  })

  it('should not authenticate a user with incorrect credentials', () => {
    const isAuthenticated = keyStore.authenticate('john', 'wrongpassword')
    expect(isAuthenticated).to.equal(false)
  })

  it('should retrieve all keys for authenticated user', () => {
    keyStore.authenticate('john', 'password123')
    const keys = keyStore.getAllKeys()
    expect(keys).to.have.property('3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0')
    expect(keys['3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0']).to.have.property('keys')
    expect(keys['3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0'].keys).to.have.property('key1')
  })

  it('should NOT retrieve all keys if NOT authenticated', () => {
    keyStore.logout()
    keyStore.authenticate('john', 'wrongpassword')
    const keys = keyStore.getAllKeys()

    expect(keys).to.be.instanceof(Error)
  })
})
