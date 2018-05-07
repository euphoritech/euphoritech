import oauth2Module from 'simple-oauth2'
import github from './github'
import salesforce from './salesforce'
import zendesk from './zendesk'

export default {
  github,
  salesforce,
  zendesk
}

export function buildConfig(type, oauthConfig, hostname) {
  if (oauthConfig.client_id && oauthConfig.client_secret) {
    const oauth2 = oauth2Module.create({
      client: {
        id: oauthConfig.client_id,
        secret: oauthConfig.client_secret,
      },
      auth: oauthConfig.auth,
    })

    let authorizeUrlObj = { redirect_uri: `${hostname}/oauth/${type}/callback` }
    if (typeof oauthConfig.scopes === 'string' || (oauthConfig.scopes instanceof Array && oauthConfig.scopes.length > 0))
      authorizeUrlObj.scope = oauthConfig.scopes

    return {
      oauthConfig,
      oauth2,
      authorizationUri: oauth2.authorizationCode.authorizeURL(authorizeUrlObj)
    }
  }

  return {}
}
