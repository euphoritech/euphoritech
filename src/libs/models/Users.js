import DatabaseModel from './DatabaseModel'
import Encryption from '../Encryption'

const encryption = new Encryption()

export default function Users(postgres, session=null) {
  const factoryToExtend = DatabaseModel(postgres, 'users')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'name', 'username_email', 'password_hash', 'first_name', 'last_name'
      ],

      async isUsernameAvailabile(usernameEmail) {
        const { rows } = await postgres.query(`
          select username_email from users where username_email = $1
        `, [ usernameEmail ])
        return rows.length === 0
      },

      async validateUserPassword(username, plainPassword) {
        const record = await this.findByColumn(username, 'username_email')
        if (record) {
          const pwHash = record.password_hash
          return await Encryption.comparePassword(plainPassword, pwHash)
        }

        throw new Error(`No user with username: ${username}`)
      },

      async hashPassword(plainPassword) {
        return await Encryption.hashPassword(plainPassword)
      },

      setSession(object, sessionObj=session) {
        if (session && sessionObj) {
          for (var _key in object) {
            if (object[_key] && object[_key].toString() === '[object Object]') {
              sessionObj[_key] = sessionObj[_key] || {}
              this.setSession(object[_key], sessionObj[_key])
            } else {
              sessionObj[_key] = object[_key]
            }
          }

          session.save()
          return true
        }
        return false
      },

      login(userObject=this.record) {
        if (session) {
          session.user = session.user || {}
          userObject = Object.assign(session.user, userObject || {})
          return this.setSession({ user: userObject })
        }
        return false
      },

      logout() {
        if (session) {
          session.destroy()
          return true
        }
        return null
      }
    }
  )
}
