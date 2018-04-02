import oauth2Module from 'simple-oauth2'
import { buildConfig } from './index'
import config from '../../config'

const oauthConf = {
  auth: {
    tokenHost:      'https://github.com',
    tokenPath:      '/login/oauth/access_token',
    authorizePath:  '/login/oauth/authorize'
  },

  client_id:      config.github.appId,
  client_secret:  config.github.appSecret,

  // https://developer.github.com/apps/building-oauth-apps/scopes-for-oauth-apps/
  scopes: [ 'repo', 'read:org', 'user' ].join(','),
}

const githubConf = buildConfig('github', oauthConf, config.server.host)
export default githubConf
