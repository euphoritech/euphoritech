import Errors from './errors'
import Teams from './models/Teams'
import TeamEntityTypes from './models/TeamEntityTypes'
import TeamUserAccessRequest from './models/TeamUserAccessRequest'
import TeamsUsersRolesMap from './models/TeamsUsersRolesMap'
import TeamIntegrations from './models/TeamIntegrations'
import Users from './models/Users'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import config from '../config'

export default function LoginHandler(postgres, session) {
  const teams       = Teams(postgres)
  const teamTypes   = TeamEntityTypes(postgres)
  const teamInt     = TeamIntegrations(postgres)
  const teamAccess  = TeamUserAccessRequest(postgres)
  const teamMap     = TeamsUsersRolesMap(postgres)
  const users       = Users(postgres, session)
  const userInt     = UserOauthIntegrations(postgres)

  return {
    async standardLogin(userRecord, teamIdToLoginTo=null) {
      const didLogin = users.login(userRecord)

      // If the user has access to a team already or has an access request
      // record in 'pending' status (meaning the team admin has yet to confirm)
      // then move forward with logging the user in.
      let [ teamRoleMapRecords, accessRequestRecord ] = await Promise.all([
        teamMap.getAllByUserId(userRecord.id),
        teamAccess.getAllBy({ requesting_user_id: userRecord.id })
      ])

      const hasValidRequestRecord = accessRequestRecord.filter(r => r.status === 'pending').length > 0
      if (!hasValidRequestRecord && teamRoleMapRecords.length === 0)
        throw new Errors.NoTeamError('No team found for this user yet.')

      const userIntegrations = (await userInt.getAllByUserId(users.getLoggedInUserId())).reduce((obj, record) => {
        obj[record.type] = record
        return obj
      }, {})

      // TODO: support passing in team ID to determine the logged in team
      // of the user
      let currentLoggedInTeamId, currentLoggedInTeam, currentTypes, currentLoggedInTeamInt
      if (teamRoleMapRecords.length === 0) {
        teamRoleMapRecords = null
      } else {
        currentLoggedInTeamId   = (teamIdToLoginTo) ? teamIdToLoginTo : await teams.getTopMostTeamId(teamRoleMapRecords.map(r => r.team_id))
        currentLoggedInTeam     = await teams.findBy({ id: currentLoggedInTeamId })
        currentTypes            = await teamTypes.getAllBy({ team_id: currentLoggedInTeamId })
        currentLoggedInTeamInt  = (await teamInt.getAllBy({ team_id: currentLoggedInTeamId })).reduce((obj, record) => {
          obj[record.integration_type] = record
          return obj
        }, {})
      }

      users.setSession({
        last_login:                 new Date(),
        current_team:               currentLoggedInTeam,
        current_team_types:         currentTypes,
        current_team_integrations:  currentLoggedInTeamInt,
        teams_roles:                teamRoleMapRecords,
        user_integrations:          userIntegrations
      })
    }
  }
}
