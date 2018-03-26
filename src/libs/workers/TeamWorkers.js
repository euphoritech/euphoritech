import Promise from 'bluebird'
import moment from 'moment'
import Mailer, { getDefaultConfig } from '../Mailer'
import Teams from '../models/Teams'
import Users from '../models/Users'
import config from '../../config'

export default function TeamWorkers(options={}) {
  const postgres  = options.postgres
  const teams     = Teams(postgres)
  const users     = Users(postgres)

  return {
    sendTeamAccessRequest: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async options => {
        const requestingUserId  = options.user_id
        const targetTeamId      = options.team_id

        const mailerConfig  = await getDefaultConfig()
        const mailer        = Mailer(mailerConfig)

        const [ requestingUser, teamRecord ] = await Promise.all([
          users.findBy({ id: requestingUserId }),
          teams.findBy({ id: targetTeamId })
        ])

        const requestUserEmail  = requestingUser.name || requestingUser.username_email
        const teamOwnerId       = teamRecord.primary_contact_user_id
        const ownerUserRecord   = await users.findBy({ id: teamOwnerId })
        const ownerEmail        = ownerUserRecord.username_email

        await mailer.send({
          to: ownerEmail,
          subject: `${config.app.name}: Team access request to - ${teamRecord.name}`,
          html: `
            A user, ${requestUserEmail}, is requesting access to team: ${teamRecord.name}. Please confirm or deny this request below: <br>
            <br>
            Confirm<br>
            Deny
          `
        })
      }
    }
  }
}
