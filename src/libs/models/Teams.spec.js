import '../../../tests/spec_helper'

import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import Teams from './Teams.js'
import { createShortHierarchy, truncateTeams } from '../../../tests/factories/Teams'

const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'

const pg = new PostgresClient(postgresUrl)
const teams = Teams(pg)

describe('Teams', function() {
  describe('#getTeamHierarchy', function() {
    before('Add required teams factories', async function() {
      await truncateTeams(pg)
      await createShortHierarchy(pg)
    })

    after('Truncate teams factories', async function() {
      await truncateTeams(pg)
    })

    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.getTeamHierarchy(1)
      const result2 = await teams.getTeamHierarchy(2)
      const cols    = Object.keys(result1[0])

      assert.equal(4, result1.length)
      assert.equal(2, result2.length)
      assert.equal(true, cols.includes('cid'))    // child team ID
      assert.equal(true, cols.includes('cname'))  // child team name
      assert.equal(true, cols.includes('pid'))    // parent team ID
    })
  })

  // describe('#buildTeamNestedObject()', function() {
  //   it(`should encrypt string without issue`, async () => {
  //     const obj = await enc.encrypt(originalText)
  //     cipherText = obj.cipherText
  //     iv = obj.iv
  //     assert.equal(typeof cipherText, 'string')
  //   })
  // })
})
