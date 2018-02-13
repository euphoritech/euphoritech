import '../../../tests/spec_helper'

import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import Teams from './Teams.js'
import { createShortHierarchy, truncateTeams } from '../../../tests/factories/Teams'

const pg = new PostgresClient()
const teams = Teams(pg)

describe('Teams', function() {
  describe('#getTeamHierarchy', function() {
    before('Add required team factories', async function() {
      await truncateTeams()
      await createShortHierarchy()
    })

    after('Truncate team factories', async function() {
      await truncateTeams()
    })

    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.getTeamHierarchy(1)
      const result2 = await teams.getTeamHierarchy(2)
      // console.log('results', result1, result2)

      assert.equal(4, result1.length)
      assert.equal(2, result2.length)
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
