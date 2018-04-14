import bunyan from 'bunyan'
import Errors from '../libs/errors'
import PostgresClient from '../libs/PostgresClient'
import Teams from '../libs/models/Teams'
import TeamsUsersRolesMap from '../libs/models/TeamsUsersRolesMap'
import Users from '../libs/models/Users'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const postgres = new PostgresClient()

export default async function AuthCreateAccount(req, res) {
  const username        = req.body.username
  const password        = req.body.password
  const confirmPassword = req.body.cpassword
  const createNewTeam   = req.body.create_team
  const teamId          = req.body.team_id
  const teamName        = req.body.team_name
  const teams           = Teams(postgres)
  const teamUserMap     = TeamsUsersRolesMap(postgres)
  const usersInst       = Users(postgres, req.session)

  if (password !== confirmPassword)
    throw new Errors.PasswordNotMatch(`Your passwords do not match.`)

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
    const newTeamRecord = await teams.findOrCreateBy({
      parent_team_id: 1,
      external_id: teamId,
      name: teamName,
      primary_contact_user_id: userId
    })
    await teamUserMap.findOrCreateBy({ team_id: newTeamRecord.id, user_id: userRecord.id, role: 'teamadmin' })
  } else {
    // TODO team access request, see teams API #access
  }

  res.redirect('/')
}
