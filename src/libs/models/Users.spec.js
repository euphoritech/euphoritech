import '../../../tests/spec_helper'

import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import Users from './Users.js'

const NOOP = () => {}
const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'

const pg = new PostgresClient(postgresUrl)
const users = Users(pg)

describe('Users', function() {
  describe('#setSession', function() {
    it('should set key/value pairs in the session', function() {
      const session1          = { save: function() { this.num_saves++ }, num_saves: 0, test_key: 'test_val' }
      const session2          = { save: function() { this.num_saves++ }, num_saves: 0, test_key: 'test_val' }
      const usersWithSession1 = Users(pg, session1)
      const usersWithSession2 = Users(pg, session2)
      const shouldBeFalse     = users.setSession({})
      const result1           = usersWithSession1.setSession({ my_key: 'my_val' })
      const result2           = usersWithSession2.setSession({ obj1: { obj2: { my_val: 'lance' }}})

      assert.equal(false, shouldBeFalse)
      assert.equal(true, result1)
      assert.equal(true, result2)

      assert.equal(1, session1.num_saves)
      assert.equal('my_val', session1.my_key)

      assert.equal(3, session2.num_saves)
      assert.equal('[object Object]', session2.obj1.toString())
      assert.equal('lance', session2.obj1.obj2.my_val)
    })
  })

  describe('#login', function() {
    it('should set key/value pairs under the `user` key in the session', function() {
      const session          = { save: function() { this.num_saves++ }, num_saves: 0, test_key: 'test_val' }
      const usersWithSession = Users(pg, session)
      const result1           = usersWithSession.login({ my_key: 'my_val' })

      assert.equal(2, session.num_saves)
      assert.equal('my_val', session.user.my_key)
    })
  })

  describe('#generateTempPassword', function() {
    it('should generate a random string of alphanumeric characters of length specified', function() {
      const users = Users()
      const password = users.generateTempPassword(10)

      assert.equal(10, password.length)
      assert.equal(true, /[\w\d]{10}/.test(password))
    })
  })
})
