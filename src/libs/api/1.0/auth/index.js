import objectAssignDeep from 'object-assign-deep'
import SessionHandler from '../../../SessionHandler'
import Users from '../../../models/Users'
import UserOauthIntegrations from '../../../models/UserOauthIntegrations'

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

  async usernameAvailable({ req, res, postgres }) {
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
    const users   = Users(postgres, req.session)
    const integ   = UserOauthIntegrations(postgres)
    const records = await integ.getAllByUserId(users.getLoggedInUserId())
    const recordObj = records.reduce((obj, record) => {
      obj[record.type] = record
      return obj
    }, {})
    res.json({ integrations: recordObj })
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

      const isCurrentPasswordCorrect = await users.validateUserPassword(userRec.username_email, currentPassword)
      if (!isCurrentPasswordCorrect)
        return res.status(401).json({ error: res.__(`The current password you provided is not correct. Please try again.`) })
    }

    const newHashedPassword = await users.hashPassword(newPassword)
    users.setRecord({ id: userRec.id, password_hash: newHashedPassword })
    await users.save()
    await session.resetTeamSessionRefresh(currentTeamId)

    res.json(true)
  }
}
