import PassportGithub from 'passport-github2'
// import Auth from '../libs/Auth'
import config from '../config'

const GithubStrategy = PassportGithub.Strategy

export default function PassportGithubPassportStrategy(postgresClient) {
  return {
    strategy: PassportGithub.Strategy,
    options: {
      clientID:           config.github.appId,
      clientSecret:       config.github.appSecret,
      callbackURL:        config.github.loginCallbackUrl,
      passReqToCallback:  true
    },
    handler: async function PassportGithubPassportHandler(req, accessToken, refreshToken, profile, done) {
      try {
        // const auth = new Auth({ postgres: postgresClient, session: req.session })

        const intInfo = Object.assign({}, profile, {
          type:           'github',
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
