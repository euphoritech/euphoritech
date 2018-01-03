import PassportGoogle from 'passport-google-oauth20'
// import Auth from '../libs/Auth'
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
        // const auth = new Auth({ postgres: postgresClient, session: req.session })

        const intInfo = Object.assign({}, profile, {
          type:           'google',
          unique_id:      profile.id,
          name:           `${profile.name.givenName} ${profile.name.familyName}`,
          first_name:     profile.name.givenName,
          last_name:      profile.name.familyName,
          email:          userEmail,
          access_token:   accessToken,
          refresh_token:  refreshToken
        })

        // const userId      = await auth.findOrCreateUser(intInfo)
        // const userRecord  = await auth.getUser(userId)
        // auth.login({ id: userId })

        return done(null, intInfo.unique_id)

      } catch(err) {
        done(err)
      }
    }
  }
}
