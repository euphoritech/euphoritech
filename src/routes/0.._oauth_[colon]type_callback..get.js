import oauthConfigs from '../conf/oauth'
import config from '../config'

export default function oauthType(req, res) {
  const oauthType = req.params.type
  const oauthConf = oauthConfigs[oauthType]
  const code      = req.query.code

  const options = { code }
  oauthConf.oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error)
      return res.status(500).json({ error })

    console.log('The resulting token:', result)
    const token = oauthConf.oauth2.accessToken.create(result)

    // TODO: Store in database and redirect back to config page
    return res.json(token)
  })
}
