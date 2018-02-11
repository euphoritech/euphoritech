import oauth2Module from 'simple-oauth2'
import github from './github'
import salesforce from './salesforce'

export default {
  github,
  salesforce
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

    return {
      oauthConfig,
      oauth2,
      authorizationUri: oauth2.authorizationCode.authorizeURL({
        redirect_uri: `${hostname}/oauth/${type}/callback`,
        scope: oauthConfig.scopes
      })
    }
  }

  return {}
}
