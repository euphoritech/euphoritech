import oauth2Module from 'simple-oauth2'
import { buildConfig } from './index'
import config from '../../config'

const oauthConf = {
  auth: {
    tokenHost:      'https://login.salesforce.com',
    tokenPath:      '/services/oauth2/token',
    authorizePath:  '/services/oauth2/authorize'
  },

  client_id:      config.salesforce.appId,
  client_secret:  config.salesforce.appSecret
}

const sfdcConf = buildConfig('salesforce', oauthConf, config.server.host)
export default sfdcConf
