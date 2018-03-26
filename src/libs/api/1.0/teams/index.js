import NodeResque from 'node-resque'
import Teams from '../../../models/Teams'
import TeamsUsersRolesMap from '../../../models/TeamsUsersRolesMap'
import TeamUserAccessRequest from '../../../models/TeamUserAccessRequest'
import Users from '../../../models/Users'
import config from '../../../../config'

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
    const teamMapRecord = await teamMap.findOrCreateBy({ team_id: newRecord.id, primary_contact_user_id: userId, role: 'teamadmin' })

    const teamRoleMapRecords = await teamMap.getAllByUserId(userId)
    users.setSession({ teams_roles: teamRoleMapRecords })

    return res.json(null)
  },

  async requestJoinTeam({ req, res, postgres, redis }) {
    const queue       = new NodeResque.Queue({ connection: { redis: redis.client }})
    const teams       = Teams(postgres)
    const users       = Users(postgres, req.session)
    const teamAccess  = TeamUserAccessRequest(postgres)
    const userId      = users.getLoggedInUserId()
    const teamExtId   = req.body.teamId

    const teamRecord = await teams.findBy({ external_id: teamExtId })
    if (!teamRecord)
      return res.status(404).json({ error: res.__(`We didn't find an existing team with the ID provided. Please make sure you typed it correctly and try again.`) })

    const newAccessRecord = await teamAccess.findOrCreateBy({ requesting_user_id: userId, team_id: teamRecord.id })
    teamAccess.setRecord({ requested_time: new Date(), status: 'pending' })
    await teamAccess.save()
    await queue.connect()
    await queue.enqueue(config.resque.default_queue, 'sendTeamAccessRequest', [{
      team_id: teamRecord.id,
      user_id: userId
    }])

    return res.json(null)
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
