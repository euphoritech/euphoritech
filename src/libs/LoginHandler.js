import Teams from './models/Teams'
import TeamsUsersRolesMap from './models/TeamsUsersRolesMap'
import TeamIntegrations from './models/TeamIntegrations'
import Users from './models/Users'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import config from '../config'

export default function LoginHandler(postgres, session) {
  const teams   = Teams(postgres)
  const teamInt = TeamIntegrations(postgres)
  const teamMap = TeamsUsersRolesMap(postgres)
  const users   = Users(postgres, session)
  const userInt = UserOauthIntegrations(postgres)

  return {
    async standardLogin(userRecord) {
      const didLogin = users.login(userRecord)

      const teamRoleMapRecords = await teamMap.getAllByUserId(userRecord.id)
      if (teamRoleMapRecords.length === 0)
        throw new Errors.NoTeamError('No team found for this user yet.')

      const userIntegrations = (await userInt.getAllByUserId(users.getLoggedInUserId())).reduce((obj, record) => {
        obj[record.type] = record
        return obj
      }, {})

      const currentLoggedInTeamId   = await teams.getTopMostTeamId(teamRoleMapRecords.map(r => r.team_id))
      const currentLoggedInTeam     = await teams.findBy({ id: currentLoggedInTeamId })
      const currentLoggedInTeamInt  = (await teamInt.getAllBy({ team_id: currentLoggedInTeamId })).reduce((obj, record) => {
        obj[record.type] = record
        return obj
      }, {})

      users.setSession({
        current_team: currentLoggedInTeam,
        current_team_integrations: currentLoggedInTeamInt,
        teams_roles:  teamRoleMapRecords,
        user_integrations: userIntegrations
      })
    }
  }
}
