import '../../../tests/spec_helper'

import path from 'path'
import assert from 'assert'
import PostgresClient from '../PostgresClient'
import TeamsUsersRolesMap from './TeamsUsersRolesMap.js'
import { createShortHierarchy, truncateTeams } from '../../../tests/factories/Teams'
import { createUser, truncateUsers } from '../../../tests/factories/Users'
import { createTeamsUsersRolesMap, truncateTeamsUsersRolesMap } from '../../../tests/factories/TeamsUsersRolesMap'

const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'

const pg = new PostgresClient(postgresUrl)
const mapInstance = TeamsUsersRolesMap(pg)

describe('TeamsUsersRolesMap', function() {
  before('Add required factories', async function() {
    await truncateTeams(pg)
    await truncateUsers(pg)
    await truncateTeamsUsersRolesMap(pg)
    await createShortHierarchy(pg)
    await createUser(pg)
    await createTeamsUsersRolesMap(pg, { team_id: 2 })
  })

  after('Remove factories from DB', async function() {
    await truncateTeams(pg)
    await truncateUsers(pg)
    await truncateTeamsUsersRolesMap(pg)
  })

  describe('#userHasAccessToTeam', function() {
    it('should give access to user who is in hierarchy', async function() {
      const shouldBeTrue1   = await mapInstance.userHasAccessToTeam(1, 2)  // user has role mapping record at teamId == 2, so has access
      const shouldBeTrue2   = await mapInstance.userHasAccessToTeam(1, 4)  // teamId == 4 is a subchild of teamId == 2 (see #createShortHierarchy)
      const shouldBeFalse1  = await mapInstance.userHasAccessToTeam(1, 1)  // teamId == 1 is the global team and is above teamId == 2 where user has mapping record
      const shouldBeFalse2  = await mapInstance.userHasAccessToTeam(1, 6)  // teamId == 6 does not exist
      assert.equal(true, shouldBeTrue1)
      assert.equal(true, shouldBeTrue2)
      assert.equal(false, shouldBeFalse1)
      assert.equal(false, shouldBeFalse2)
    })
  })
})
