import oauth2Module from 'simple-oauth2'
import config from '../../config'

const oauthConf = {
  auth: {
    tokenHost:      'https://github.com',
    tokenPath:      '/login/oauth/access_token',
    authorizePath:  '/login/oauth/authorize'
  },

  client_id: config.github.appId,
  client_secret: config.github.appSecret,

  // https://developer.github.com/apps/building-oauth-apps/scopes-for-oauth-apps/
  // scopes: [],
}


export default {
  oauthConf,

  oauth2: oauth2Module.create({
    client: {
      id: oauthConf.client_id,
      secret: oauthConf.client_secret,
    },
    auth: oauthConf.auth,
  }),

  authorizationUri(oauthType) {
    return this.oauth2.authorizationCode.authorizeURL({
      redirect_uri: `${config.host}/oauth/${oauthType}/callback`,
      scope: this.oauthConf.scopes
    })
  }
}
