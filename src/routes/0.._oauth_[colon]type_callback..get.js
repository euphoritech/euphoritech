import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import RedisHelper from '../libs/RedisHelper'
import Routes from '../libs/Routes'
import SessionHandler from '../libs/SessionHandler'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
import oauthConfigs from '../conf/oauth'
import config from '../config'

const log       = bunyan.createLogger(config.logger.options)
const redis     = new RedisHelper()
const postgres  = new PostgresClient()

export default async function oauthTypeCallback(req, res) {
  try {
    const oauthType   = req.params.type
    const oauthConf   = oauthConfigs[oauthType]
    const callbackErr = req.query.error
    const code        = req.query.code

    const session = SessionHandler(req.session, { redis })
    const users   = Users(postgres, req.session)
    const userInt = UserOauthIntegrations(postgres)

    const userId        = users.getLoggedInUserId()
    const currentTeamId = session.getCurrentLoggedInTeam()

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
    const intRecord = await userInt.findOrCreateBy({ user_id: userId, type: oauthType })
    userInt.setRecord(Object.assign(intInfo, { id: intRecord.id }))
    await userInt.save()
    await session.resetTeamSessionRefresh(currentTeamId)

    return Routes.checkAndRedirect(req, res, '/')

  } catch(error) {
    log.error("Error with oauth callback", error)
    return res.status(500).json({ error })
  }
}
