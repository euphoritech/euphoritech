import NodeResque from 'node-resque'
import SessionHandler from '../../../SessionHandler'
import Teams from '../../../models/Teams'
import TeamApiKeys from '../../../models/TeamApiKeys'
import TeamEntityTypes from '../../../models/TeamEntityTypes'
import TeamIntegrations from '../../../models/TeamIntegrations'
import TeamsUsersRolesMap from '../../../models/TeamsUsersRolesMap'
import TeamUserAccessRequest from '../../../models/TeamUserAccessRequest'
import Users from '../../../models/Users'
import config from '../../../../config'

export default {
  async teamAvailable({ req, res, postgres }) {
    const teams   = Teams(postgres)
    const teamId  = req.query.teamId

    const teamRecord = await teams.findBy({ external_id: teamId })
    res.json(!teamRecord)
  },

  async teamExists({ req, res, postgres }) {
    let teamIsAvailable
    await this.teamAvailable({ req, res: { json: available => teamIsAvailable = available }, postgres })
    res.json(!teamIsAvailable)
  },

  async getApiKeys({ req, res, postgres }) {
    const keysInst  = TeamApiKeys(postgres)
    const session   = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()

    if (!currentTeamId)
      return res.json({ keys: [] })

    const keys = await keysInst.getAllBy({ team_id: currentTeamId })
    return res.json({ keys })
  },

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

    const newTeamRecord = await teams.create({ teamExtId, teamName, userId })
    const teamMapRecord = await teamMap.findOrCreateBy({ team_id: newTeamRecord.id, primary_contact_user_id: userId, role: 'teamadmin' })

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

  async access({ req, res, postgres, redis }) {
    const queue         = new NodeResque.Queue({ connection: { redis: redis.client }})
    const teamAccess    = TeamUserAccessRequest(postgres)
    const teamUserMap   = TeamsUsersRolesMap(postgres)
    const accessRecUuid = req.query.uid
    const confType      = req.query.type
    const userType      = req.query.userType
    const teamAccRecord = await teamAccess.findBy({ unique_id: accessRecUuid })
    await queue.connect()

    if (!teamAccRecord)
      return res.status(404).json({ error: res.__("We can't find the request you are looking for. Please confirm you have the right ID and try again.") })

    switch(confType) {
      case 'confirm':
        teamAccess.setRecord(Object.assign(teamAccRecord, { status: 'confirmed' }))
        await teamAccess.save()
        await teamUserMap.findOrCreateBy({ team_id: teamAccRecord.team_id, user_id: teamAccRecord.requesting_user_id, role: userType || 'teamadmin' })
        await queue.enqueue(config.resque.default_queue, 'sendTeamAccessConfirmation', [{ record_id: teamAccRecord.id }])
        return res.redirect('/')

      case 'deny':
        teamAccess.setRecord(Object.assign(teamAccRecord, { status: 'denied' }))
        await teamAccess.save()
        await queue.enqueue(config.resque.default_queue, 'sendTeamAccessConfirmation', [{ record_id: teamAccRecord.id }])
        return res.redirect('/')

      default:
        return res.status(404).json({ error: res.__("We don't recognize what you're trying to do. Please try again.") })
    }
  },

  async getCurrentHierarchy({ req, res, postgres }) {
    const teams         = Teams(postgres)
    const turm          = TeamsUsersRolesMap(postgres)
    const users         = Users(postgres, req.session)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const teamId        = req.query.teamId || currentTeamId
    const userId        = users.getLoggedInUserId()

    if (!teamId)
      return res.status(400).json({ error: res.__("Please provide a valid team ID to get it's hierarchy.") })

    if (await turm.userHasAccessToTeam(userId, teamId)) {
      const hierarchyObject = await teams.getEntireHierarchy(teamId)
      return res.json({ hierarchy: hierarchyObject })
    }
    res.status(401).json({ error: res.__("You do not have access to this team.") })
  },

  async hasIntegration({ req, res, postgres }) {
    const intTypeToCheck = req.query.type
    let currentIntegr
    await this.getCurrentTeamIntegrations({ req, res: { json: ({ integrations }) => currentIntegr = integrations }, postgres })

    res.json(!!currentIntegr[intTypeToCheck])
  },

  async getCurrentTeamIntegrations({ req, res, postgres }) {
    const teamIntegrations        = TeamIntegrations(postgres)
    const session                 = SessionHandler(req.session)
    const currentLoggedInTeamId   = session.getCurrentLoggedInTeam()
    const currentLoggedInTeamInt  = (await teamIntegrations.getAllBy({ team_id: currentLoggedInTeamId })).reduce((obj, record) => {
      obj[record.type] = record
      return obj
    }, {})

    res.json({ integrations: currentLoggedInTeamInt })
  },

  async entityTypes({ req, res, postgres }) {
    const session   = SessionHandler(req.session)
    const teamId    = session.getCurrentLoggedInTeam()

    if (!teamId)
      return res.json({ types: [] })

    const typesInst = TeamEntityTypes(postgres)
    const types     = await typesInst.getAllBy({ team_id: teamId })

    res.json({ types })
  },

  async users({ req, res, postgres }) {
    const page      = req.query.page || 1
    const pageSize  = req.query.pageSize || 10
    const turm      = TeamsUsersRolesMap(postgres)
    const session   = SessionHandler(req.session)
    const teamId    = session.getCurrentLoggedInTeam()

    if (!teamId)
      return res.json({ users: [] })

    const users = await turm.getAllByTeamId(teamId, page, pageSize)

    res.json({ users })
  }
}
