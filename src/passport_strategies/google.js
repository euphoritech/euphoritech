import PassportGoogle from 'passport-google-oauth20'
import { passportOauthLoginHandler } from '../libs/Helpers'
import config from '../config'

const GoogleStrategy = PassportGoogle.Strategy

export default function GooglePassportStrategy({ postgres, redis }) {
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
        const emailAddress = profile.emails[0].value

        await passportOauthLoginHandler({
          req,
          accessToken,
          refreshToken,
          profile,
          postgres,
          emailAddress,
          done,
          type:       'google',
          name:       `${profile.name.givenName} ${profile.name.familyName}`,
          firstName:  profile.name.givenName,
          lastName:   profile.name.familyName
        })

      } catch(err) {
        done(err)
      }
    }
  }
}
