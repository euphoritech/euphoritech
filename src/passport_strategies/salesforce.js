import PassportForceDotCom from 'passport-forcedotcom'
import SessionHandler from '../libs/SessionHandler'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
import config from '../config'

const ForceDotComStrategy = PassportForceDotCom.Strategy

// NOTE: This is not a typical passportjs auth strategy like github and google:
// We would use the simple-oauth2 module and the /oauth/:type + /oauth/:type/callback
// routes, although for some reason we're getting a redirect_uri_mismatch
// error with no real explanation.
export default function SalesforcePassportStrategy({ postgres, redis }) {
  return {
    strategy: ForceDotComStrategy,
    options: {
      clientID:           config.salesforce.appId,
      clientSecret:       config.salesforce.appSecret,
      callbackURL:        config.salesforce.loginCallbackUrl,
      passReqToCallback:  true
    },
    handler: async function SalesforcePassportHandler(req, accessToken, refreshToken, profile, done) {
      try {
        const session = SessionHandler(req.session, { redis })
        const users   = Users(postgres, req.session)
        const userInt = UserOauthIntegrations(postgres)

        const userId        = users.getLoggedInUserId()
        const currentTeamId = session.getCurrentLoggedInTeam()

        if (!users.isLoggedIn())
          return res.redirect('/')

        const intInfo   = {
          type:           'salesforce',
          access_token:   accessToken.params.access_token,
          refresh_token:  refreshToken,
          unique_id:      profile.id,
          first_name:     profile.name.givenName,
          last_name:      profile.name.familyName,
          email:          (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null,
          mod1:           accessToken.params.instance_url
        }
        const intRecord = await userInt.findOrCreateBy({ user_id: userId, type: 'salesforce' })
        userInt.setRecord(Object.assign(intInfo, { id: intRecord.id }))
        await userInt.save()
        await session.resetTeamSessionRefresh(currentTeamId)

        return done(null, profile.id)

      } catch(err) {
        done(err)
      }
    }
  }
}
