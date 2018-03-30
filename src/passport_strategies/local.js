import PassportLocal from "passport-local"
import Users from '../libs/models/Users'
import Errors from '../libs/errors'
import LoginHandler from '../libs/LoginHandler'
import config from '../config'

const LocalStrategy = PassportLocal.Strategy

export default function LocalPassportStrategy(postgresClient) {
  return {
    strategy: LocalStrategy,
    options: {
      passReqToCallback: true
    },
    handler: async function PassportLocalHandler(req, username, password, done) {
      try {
        const users = Users(postgresClient, req.session)
        const login = LoginHandler(postgresClient, req.session)

        if (username && username == config.auth.GLOBAL_ADMIN)
          return done(null, (users.validateUserPassword(username, password, config.auth.GLOBAL_PASSWORD) ? username : false))

        let userRecord = await users.findBy({ username_email: username })

        if (!userRecord)
          throw new Errors.NoUserRecord(`We didn't find a user record with the provided e-mail address yet.`)

        if (!userRecord.password_hash)
          throw new Errors.NoPassword(`No password yet.`)

        if (!(await users.validateUserPassword(username, password)))
          throw new Errors.IncorrectPassword(`Bad password.`)

        users.setRecord(Object.assign({}, {
          last_login: new Date(),
          num_logins: (userRecord.num_logins || 0) + 1
        }, { id: userRecord.id }))
        await users.save()
        
        await login.standardLogin(userRecord)
        return done(null, username)

      } catch(err) {
        done(err)
      }
    }
  }
}
