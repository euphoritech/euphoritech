import oauth2Module from 'simple-oauth2'
import { buildConfig } from './index'
import config from '../../config'

function oauthConf(session) {
  return {
    auth: {
      tokenHost:      `https://${session.team_integrations.zendesk.mod1}.zendesk.com`,
      tokenPath:      '/oauth/tokens',
      authorizePath:  '/oauth/authorizations/new'
    },

    client_id:      config.zendesk.appId,
    client_secret:  config.zendesk.appSecret,

    // https://support.zendesk.com/hc/en-us/articles/203663836-Using-OAuth-authentication-with-your-application#topic_ar1_mfs_qk
    scopes: [ 'read' ].join(',')
  }
}

export default function zendeskConf(session) {
  return buildConfig('zendesk', oauthConf(session), config.server.host)
}
