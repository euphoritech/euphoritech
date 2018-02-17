import PassportGithub from 'passport-github2'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
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
        const users   = Users(postgresClient, req.session)
        const userInt = UserOauthIntegrations(postgresClient)
        console.log('GITHUB PROFILE', profile)

        const emailAddress = profile.emails[0].value

        const intInfo = Object.assign({}, profile, {
          type:           'github',
          unique_id:      profile.id,
          name:           `${profile.name.givenName} ${profile.name.familyName}`,
          first_name:     profile.name.givenName,
          last_name:      profile.name.familyName,
          email:          emailAddress,
          access_token:   accessToken,
          refresh_token:  refreshToken
        })

        const userRecord  = await users.findOrCreateBy({ username_email: emailAddress })
        users.setRecord({ first_name: userRecord.first_name || intInfo.first_name, last_name: userRecord.last_name || intInfo.last_name })
        await users.save()

        const intRecord   = await userInt.findOrCreateBy({ user_id: userRecord.id, type: 'github', unique_id: profile.id })
        userInt.setRecord(intInfo)
        await intInfo.save()

        const didLogin = users.login(userRecord)
        return done(null, intInfo.unique_id)

      } catch(err) {
        done(err)
      }
    }
  }
}
