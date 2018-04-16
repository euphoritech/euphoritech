import '../../../tests/spec_helper'

import assert from 'assert'
import PostgresClient from '../PostgresClient'
import TeamApiKeys from './TeamApiKeys.js'

const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'

const pg = new PostgresClient(postgresUrl)
const apiKeys = TeamApiKeys(pg)

describe('TeamApiKeys', function() {
  describe('#createKey', function() {
    it('should create a new key (SHA1 hash)', async function() {
      const newKey = apiKeys.createKey(123, 1)
      assert.equal(40, newKey.length)
    })
  })
})
