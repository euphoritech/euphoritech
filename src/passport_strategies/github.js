import PassportGithub from 'passport-github2'
import GithubApi from '../libs/GithubApi'
import { passportOauthLoginHandler } from '../libs/Helpers'
import config from '../config'

const GithubStrategy = PassportGithub.Strategy

export default function GithubPassportStrategy({ postgres, redis }) {
  return {
    strategy: GithubStrategy,
    options: {
      clientID:           config.github.appId,
      clientSecret:       config.github.appSecret,
      callbackURL:        config.github.loginCallbackUrl,
      passReqToCallback:  true
    },
    handler: async function GithubPassportHandler(req, accessToken, refreshToken, profile, done) {
      try {
        const emailResponse = await GithubApi(accessToken).emails()
        const emailAddress = (emailResponse.data[0]) ? emailResponse.data[0].email : null

        await passportOauthLoginHandler({
          req,
          accessToken,
          refreshToken,
          profile,
          postgres,
          emailAddress,
          done,
          type:       'github',
          name:       profile._json.name,
          firstName:  profile._json.name.split(' ')[0],
          lastName:   profile._json.name.split(' ')[1]
        })

      } catch(err) {
        done(err)
      }
    }
  }
}
