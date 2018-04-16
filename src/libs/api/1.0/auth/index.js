import Users from '../../../models/Users'
import UserOauthIntegrations from '../../../models/UserOauthIntegrations'

export default {
  session({ req, res }) {
    res.json({ session: req.session })
  },

  async usernameAvailable({ req, res, postgres }) {
    const users     = Users(postgres)
    const username  = req.query.username

    const userRecord = await users.findBy({ username_email: username })
    res.json(!userRecord)
  },

  setRedirect({ req, res }) {
    req.session.returnTo = req.body.target
    req.session.save()
    res.json(null)
  },

  hasIntegration({ req, res }) {
    const intTypeToCheck  = req.query.type
    const currentIntegr   = req.session.user_integrations
    res.json(!!currentIntegr[intTypeToCheck])
  },

  async getIntegrations({ req, res, postgres }) {
    const users   = Users(postgres, req.session)
    const integ   = UserOauthIntegrations(postgres)
    const records = await integ.getAllByUserId(users.getLoggedInUserId())
    const recordObj = records.reduce((obj, record) => {
      obj[record.type] = record
      return obj
    }, {})
    res.json({ integrations: recordObj })
  }
}
