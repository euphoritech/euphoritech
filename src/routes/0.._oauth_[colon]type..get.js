import bunyan from 'bunyan'
import oauthConfigs from '../conf/oauth'
import Users from '../libs/models/Users'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default function oauthType(req, res) {
  const users     = Users(null, req.session)
  const oauthType = req.params.type

  if (!users.isLoggedIn())
    return res.status(401).json({ error: `You need to be logged in to authenticate with: ${oauthType}` })

  const oauthConf = (typeof oauthConfigs[oauthType] === 'function') ? oauthConfigs[oauthType](req.session) : oauthConfigs[oauthType]
  if (!oauthConf)
    return res.status(404).json({ error: `We don't support oauth 2.0 yet for: ${oauthType}` })

  const authorizationUri = oauthConf.authorizationUri

  log.info(`Initializing OAuth flow to auth URI`, authorizationUri)
  return res.redirect(authorizationUri)
}
