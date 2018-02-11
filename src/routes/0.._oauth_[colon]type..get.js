import bunyan from 'bunyan'
import oauthConfigs from '../conf/oauth'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default function oauthType(req, res) {
  const oauthType = req.params.type
  const oauthConf = oauthConfigs[oauthType]

  if (!oauthConf)
    return res.status(404).json({ error: `We don't support oauth 2.0 yet for: ${oauthType}` })

  const authorizationUri = oauthConf.authorizationUri

  log.debug(`Initializing OAuth flow to auth URI`, authorizationUri)
  return res.redirect(authorizationUri)
}
