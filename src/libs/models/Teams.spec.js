import '../../../tests/spec_helper'

import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import Teams, { buildTeamNestedObject } from './Teams.js'
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

  describe('#hierarchyFromTop', function() {
    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.hierarchyFromTop(1)
      const result2 = await teams.hierarchyFromTop(2)
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

  describe('#hierarchyFromBottom', function() {
    it('should provide the correct team hierarchy', async function() {
      const result1 = await teams.hierarchyFromBottom(1)
      const result2 = await teams.hierarchyFromBottom(2)
      const result3 = await teams.hierarchyFromBottom(4)
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

  describe('#buildTeamNestedObject()', function() {
    it(`should build nested object of teams and children`, async () => {
      const obj = buildTeamNestedObject([
        { cid: 1, cname: 'Global', pid: null },
        { cid: 2, cname: 'Team1', pid: 1 },
        { cid: 3, cname: 'Team2', pid: 1 },
        { cid: 4, cname: 'SubTeam1', pid: 2 },
        { cid: 5, cname: 'SubSubTeam1', pid: 4 }
      ])

      // The expected object structure
      // {
      //   "id": 1,
      //   "name": "Global",
      //   "children": {
      //     "2": {
      //       "id": 2,
      //       "name": "Team1",
      //       "children": {
      //         "4": {
      //           "id": 4,
      //           "name": "SubTeam1",
      //           "children": {
      //             "5": {
      //               "id": 5,
      //               "name": "SubSubTeam1"
      //             }
      //           }
      //         }
      //       }
      //     },
      //     "3": {
      //       "id": 3,
      //       "name": "Team2"
      //     }
      //   }
      // }
      assert.equal(true, obj.id === 1)
      assert.equal(true, obj.children['2'].id === 2)
      assert.equal(true, obj.children['3'].id === 3)
      assert.equal(true, obj.children['2'].children['4'].id === 4)
      assert.equal(true, obj.children['2'].children['4'].name === 'SubTeam1')
      assert.equal(true, obj.children['2'].children['4'].children['5'].id === 5)
    })
  })
})
