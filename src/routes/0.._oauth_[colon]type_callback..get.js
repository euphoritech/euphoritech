import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Routes from '../libs/Routes'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
import oauthConfigs from '../conf/oauth'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const postgres  = new PostgresClient()

export default async function oauthTypeCallback(req, res) {
  try {
    const oauthType   = req.params.type
    const oauthConf   = oauthConfigs[oauthType]
    const callbackErr = req.query.error
    const code        = req.query.code

    const users   = Users(postgres, req.session)
    const userInt = UserOauthIntegrations(postgres)

    if (!users.isLoggedIn())
      return res.redirect('/')

    if (callbackErr)
      return res.status(500).json({ error: req.query })

    const options = { code }
    const result = await oauthConf.oauth2.authorizationCode.getToken(options)
    if (result && result.error)
      return res.status(500).json({ error: result })

    // Example `token`: {"token":{"access_token":"7095d09f1d8e020b881c93d25e472ca097749910","token_type":"bearer","scope":"","expires_at":null}}
    const token = oauthConf.oauth2.accessToken.create(result)
    log.debug(`${oauthType} OAuth token`, token)

    const intInfo   = { type: oauthType, access_token: token.token.access_token }
    const intRecord = await userInt.findOrCreateBy({ user_id: users.getLoggedInUserId(), type: oauthType })
    userInt.setRecord(Object.assign(intInfo, { id: intRecord.id }))
    await userInt.save()

    return Routes.checkAndRedirect(req, res, '/')

  } catch(error) {
    log.error("Error with oauth callback", error)
    return res.status(500).json({ error })
  }
}
