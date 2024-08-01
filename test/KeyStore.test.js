/* global describe, it */
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
    console.log('Retrieved keys:', keys)
    expect(keys).to.have.property('3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0')
    expect(keys['3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0']).to.have.property('keys')
    expect(keys['3e1b7ce5-90af-4fb0-bc11-f2b7f4b547c0'].keys).to.have.property('key1')
  })
})
