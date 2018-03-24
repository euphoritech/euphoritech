import Teams from '../../../models/Teams'
import TeamsUsersRolesMap from '../../../models/TeamsUsersRolesMap'
import Users from '../../../models/Users'

export default {
  async create({ req, res, postgres }) {
    const teams     = Teams(postgres)
    const teamMap   = TeamsUsersRolesMap(postgres)
    const users     = Users(postgres, req.session)
    const userId    = users.getLoggedInUserId()
    const teamExtId = req.body.teamId
    const teamName  = req.body.teamName

    const teamAlreadyExists = await teams.findBy({ external_id: teamExtId })
    if (teamAlreadyExists)
      return res.status(400).json({ error: res.__(`There is already a team with ID: ${teamExtId}`) })

    const newRecord = await teams.findOrCreateBy({
      parent_team_id: 1,
      external_id: teamExtId,
      name: teamName,
      primary_contact_user_id: userId
    })
    const teamMapRecord = await teamMap.findOrCreateBy({ team_id: newRecord.id, user_id: userId, role: 'teamadmin' })

    const teamRoleMapRecords = await teamMap.getAllByUserId(userId)
    users.setSession({ teams_roles: teamRoleMapRecords })

    return res.json(null)
  },

  async requestJoinTeam({ req, res, postgres }) {

  },

  async getCurrentHierarchy({ req, res, postgres }) {
    const teams   = Teams(postgres)
    const turm    = TeamsUsersRolesMap(postgres)
    const users   = Users(postgres, req.session)
    const teamId  = req.query.teamId || ((req.session.teams_roles) ? req.session.teams_roles['0'].team_id : null)
    const userId  = users.getLoggedInUserId()

    if (!teamId)
      return res.status(400).json({ error: res.__("Please provide a valid team ID to get it's hierarchy.") })

    if (await turm.userHasAccessToTeam(userId, teamId)) {
      const hierarchyObject = await teams.getEntireHierarchy(teamId)
      return res.json({ hierarchy: hierarchyObject })
    }
    res.status(401).json(null)
  }
}
