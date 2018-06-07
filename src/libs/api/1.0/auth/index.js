import NodeResque from 'node-resque'
import objectAssignDeep from 'object-assign-deep'
import SessionHandler from '../../../SessionHandler'
import Users from '../../../models/Users'
import UserOauthIntegrations from '../../../models/UserOauthIntegrations'
import config from '../../../../config'

export default {
  session({ req, res }) {
    res.json({ session: req.session })
  },

  ['session/set']({ req, res, postgres }) {
    const users   = Users(postgres, req.session)
    const session = SessionHandler(req.session)
    const userId  = session.getLoggedInUserId()
    const data    = req.body.data
    const key     = req.body.key || '__temp'

    if (data.toString() !== '[object Object]')
      return res.status(400).json({ error: res.__("Make sure you pass an object to add to the session.") })

    users.setSession({ [ key ]: objectAssignDeep(req.session[key] || {}, data) })
    res.json(true)
  },

  async ['username/available']({ req, res, postgres }) {
    const users     = Users(postgres)
    const username  = req.query.username

    const userRecord = await users.findBy({ username_email: username })
    res.json(!userRecord)
  },

  ['redirect/set']({ req, res }) {
    req.session.returnTo = req.body.target
    req.session.save()
    res.json(null)
  },

  hasIntegration({ req, res }) {
    const intTypeToCheck  = req.query.type
    const currentIntegr   = req.session.user_integrations
    res.json(!!currentIntegr[intTypeToCheck])
  },

  async ['integrations/get']({ req, res, postgres }) {
    const integ   = UserOauthIntegrations(postgres)
    const session = SessionHandler(req.session)
    const records = await integ.getAllByUserId(session.getLoggedInUserId())
    const recordObj = records.reduce((obj, record) => {
      obj[record.type] = record
      return obj
    }, {})
    res.json({ integrations: recordObj })
  },

  async ['password/forgot']({ req, res, redis, postgres }) {
    const queue     = new NodeResque.Queue({ connection: { redis: redis.client }})
    const users     = Users(postgres, req.session)
    const username  = req.body.email

    const userRecord = await users.findBy({ username_email: username })
    if (!userRecord)
      return res.status(404).json({ error: res.__(`We didn't find a user record with the email address provided.`) })

    const tempPassword  = users.generateTempPassword()
    const tempPwHash    = await users.hashPassword(tempPassword)
    users.setRecord({ id: userRecord.id, needs_password_reset: true, password_hash: tempPwHash })
    await users.save()

    await queue.connect()
    await queue.enqueue(config.resque.default_queue, 'forgotPasswordMailer', [{
      user_email: userRecord.username_email,
      temp_pw:    tempPassword
    }])

    res.json(true)
  },

  async ['password/reset']({ req, res, redis, postgres }) {
    const session           = SessionHandler(req.session, { redis })
    const users             = Users(postgres, req.session)
    const userRec           = session.getLoggedInUserId(true)
    const currentTeamId     = session.getCurrentLoggedInTeam()
    const currentPassword   = req.body.current_password
    const newPassword       = req.body.new_password

    if (userRec.password_hash) {
      if (!currentPassword)
        return res.status(401).json({ error: res.__(`Please enter your current password to validate before changing.`) })

      if (currentPassword === newPassword)
        return res.status(400).json({ error: res.__(`Please enter a different password than your previous one.`) })

      const isCurrentPasswordCorrect = await users.validateUserPassword(userRec.username_email, currentPassword)
      if (!isCurrentPasswordCorrect)
        return res.status(401).json({ error: res.__(`The current password you provided is not correct. Please try again.`) })
    }

    const newHashedPassword = await users.hashPassword(newPassword)
    users.setRecord({ id: userRec.id, password_hash: newHashedPassword, needs_password_reset: null, last_password_reset: new Date() })
    await users.save()
    await session.resetTeamSessionRefresh(currentTeamId)

    res.json(true)
  }
}
