import PassportGithub from 'passport-github2'
import Users from '../libs/models/Users'
import UserOauthIntegrations from '../libs/models/UserOauthIntegrations'
import GithubApi from '../libs/GithubApi'
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

        const emailResponse = await GithubApi(accessToken).emails()
        const emailAddress = (emailResponse.data[0]) ? emailResponse.data[0].email : null

        if (!emailAddress)
          throw new Error('No email address found for this user.')

        const intInfo = Object.assign({}, profile, {
          type:           'github',
          unique_id:      profile.id,
          name:           profile._json.name,
          first_name:     profile._json.name.split(' ')[0],
          last_name:      profile._json.name.split(' ')[1],
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

        const intRecord = await userInt.findOrCreateBy({ user_id: userRecord.id, type: 'github', unique_id: profile.id })
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
