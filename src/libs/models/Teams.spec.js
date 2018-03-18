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
  before('Add required teams factories', async function() {
    await truncateTeams(pg)
    await createShortHierarchy(pg)
  })

  after('Truncate teams factories', async function() {
    await truncateTeams(pg)
  })

  describe('#getEntireHierarchy', function() {
    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.getEntireHierarchy(1)
      const result2 = await teams.getEntireHierarchy(2)
      const cols    = Object.keys(result1[0])

      assert.equal(4, result1.length)
      assert.equal('1,2,3,4', result1.map(c => c.cid).sort().join(','))
      assert.equal('0,1,1,2', result1.map(c => c.pid || 0).sort().join(','))
      assert.equal(2, result2.length)
      assert.equal(true, cols.includes('cid'))    // child team ID
      assert.equal(true, cols.includes('cname'))  // child team name
      assert.equal(true, cols.includes('pid'))    // parent team ID
    })
  })

  describe('#getParentTeams', function() {
    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.getParentTeams(1)
      const result2 = await teams.getParentTeams(2)
      const result3 = await teams.getParentTeams(4)
      const cols    = Object.keys(result1[0])

      assert.equal(1, result1.length)
      assert.equal(2, result2.length)
      assert.equal(3, result3.length)
      assert.equal('1,2,4', result3.map(c => c.cid).sort().join(','))
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
