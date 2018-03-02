import PassportGoogle from 'passport-google-oauth20'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
import config from '../config'

const GoogleStrategy = PassportGoogle.Strategy

export default function GooglePassportStrategy(postgresClient) {
  return {
    strategy: GoogleStrategy,
    options: {
      clientID:           config.google.appId,
      clientSecret:       config.google.appSecret,
      callbackURL:        config.google.loginCallbackUrl,
      passReqToCallback:  true
    },
    handler: async function GooglePassportHandler(req, accessToken, refreshToken, profile, done) {
      try {
        const users   = Users(postgresClient, req.session)
        const userInt = UserOauthIntegrations(postgresClient)

        const emailAddress = profile.emails[0].value

        const intInfo = Object.assign({}, profile, {
          type:           'google',
          unique_id:      profile.id,
          name:           `${profile.name.givenName} ${profile.name.familyName}`,
          first_name:     profile.name.givenName,
          last_name:      profile.name.familyName,
          email:          emailAddress,
          access_token:   accessToken,
          refresh_token:  refreshToken
        }, { id: undefined })

        const userRecord = await users.findOrCreateBy({ username_email: emailAddress })
        users.setRecord(Object.assign({}, intInfo, {
          first_name: userRecord.first_name || intInfo.first_name,
          last_name: userRecord.last_name || intInfo.last_name
        }, { id: userRecord.id }))
        await users.save()

        const intRecord = await userInt.findOrCreateBy({ user_id: userRecord.id, type: 'google', unique_id: profile.id })
        userInt.setRecord(Object.assign(intInfo, { id: intRecord.id }))
        await userInt.save()

        const didLogin = users.login(userRecord)
        return done(null, intInfo.unique_id)

      } catch(err) {
        done(err)
      }
    }
  }
}
