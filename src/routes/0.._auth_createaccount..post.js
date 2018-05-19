import bunyan from 'bunyan'
import NodeResque from 'node-resque'
import Errors from '../errors'
import PostgresClient from '../libs/PostgresClient'
import RedisHelper from '../libs/RedisHelper'
import LoginHandler from '../libs/LoginHandler'
import Teams from '../libs/models/Teams'
import TeamUserAccessRequest from '../libs/models/TeamUserAccessRequest'
import TeamsUsersRolesMap from '../libs/models/TeamsUsersRolesMap'
import Users from '../libs/models/Users'
import config from '../config'

const log       = bunyan.createLogger(config.logger.options)
const postgres  = new PostgresClient()
const redis     = new RedisHelper()
const queue     = new NodeResque.Queue({ connection: { redis: redis.client }})

export default async function AuthCreateAccount(req, res) {
  try {
    const username        = req.body.username
    const password        = req.body.password
    const confirmPassword = req.body.cpassword
    const createNewTeam   = req.body.create_team === 'true'
    const teamId          = req.body.team_id
    const teamName        = req.body.team_name || teamId
    const teams           = Teams(postgres)
    const teamAccess      = TeamUserAccessRequest(postgres)
    const teamUserMap     = TeamsUsersRolesMap(postgres)
    const usersInst       = Users(postgres, req.session)

    if (password !== confirmPassword)
      throw new Errors.PasswordsNotMatch(`Your passwords do not match.`)

    let userRecord = await usersInst.findBy({ username_email: username })
    if (userRecord)
      throw new Errors.UsernameAlreadyExists(`There is already a user with this email address.`)

    userRecord = await usersInst.findOrCreateBy({ username_email: username })
    usersInst.setRecord(Object.assign({
      password_hash:  await usersInst.hashPassword(password),
      first_name:     null,
      last_name:      null,
      last_login:     new Date(),
      num_logins:     1
    }, { id: userRecord.id }))
    await usersInst.save()

    if (createNewTeam) {
      const newTeamRecord = await teams.create({ teamExtId: teamId, teamName, userId: userRecord.id })
      await teamUserMap.findOrCreateBy({ team_id: newTeamRecord.id, user_id: userRecord.id, role: 'teamadmin' })

    } else {
      const existingTeam = await teams.findBy({ external_id: teamId })
      if (!existingTeam)
        throw new Errors.TeamDoesNotExist(`We didn't find a team with following ID: ${teamId}`)

      const newAccessRecord = await teamAccess.findOrCreateBy({ requesting_user_id: userRecord.id, team_id: existingTeam.id })
      teamAccess.setRecord({ requested_time: new Date(), status: 'pending' })
      await teamAccess.save()

      await queue.connect()
      await queue.enqueue(config.resque.default_queue, 'sendTeamAccessRequest', [{
        team_id: existingTeam.id,
        user_id: userRecord.id
      }])
    }

    const login = LoginHandler(postgres, req.session)
    await login.standardLogin(userRecord)
    res.redirect('/')

  } catch(err) {
    log.error("Error", err)
    res.status(500).json({ error: res.__(`There was a problem trying to create your account. Please try again.`) })
  }
}
