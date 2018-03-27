import path from 'path'
import Promise from 'bluebird'
import moment from 'moment'
import Mailer, { MailerHelpers } from '../Mailer'
import Teams from '../models/Teams'
import TeamUserAccessRequest from '../models/TeamUserAccessRequest'
import Users from '../models/Users'
import config from '../../config'

export default function TeamWorkers(options={}) {
  const postgres  = options.postgres
  const teams     = Teams(postgres)
  const accessReq = TeamUserAccessRequest(postgres)
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

        const mailerConfig  = await MailerHelpers.getGmailConfig()
        const mailer        = Mailer(mailerConfig)

        const [ requestingUser, teamRecord, accessRecord ] = await Promise.all([
          users.findBy({ id: requestingUserId }),
          teams.findBy({ id: targetTeamId }),
          accessReq.findBy({ requesting_user_id: requestingUserId, team_id: targetTeamId })
        ])

        const requestUserEmail  = requestingUser.name || requestingUser.username_email
        const teamOwnerId       = teamRecord.primary_contact_user_id
        const ownerUserRecord   = await users.findBy({ id: teamOwnerId })
        const ownerEmail        = ownerUserRecord.username_email
        const accessRecUuid     = accessRecord.unique_id

        await mailer.send({
          to: ownerEmail,
          subject: `${config.app.name}: Team access request to - ${teamRecord.name}`,
          html: await MailerHelpers.getTemplateHtml(path.join(config.app.rootDir, 'mailers', 'teams', 'request_access.pug'), {
            userEmail:  requestUserEmail,
            teamName:   teamRecord.name,
            host:       config.server.host,
            uuid:       accessRecUuid
          })
        })
      }
    },

    sendTeamAccessConfirmation: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async options => {
        const teamAccessRecordId  = options.record_id
        const accessRecord        = await accessReq.findBy({ unique_id: teamAccessRecordId })
        const userIdToSendEmail   = accessRecord.requesting_user_id
        const userRecord          = await users.findBy({ id: userIdToSendEmail })
        const requestUserEmail    = userRecord.username_email

        const mailerConfig  = await MailerHelpers.getGmailConfig()
        const mailer        = Mailer(mailerConfig)

        let subject           = `${config.app.name}: You now have access to team - ${teamRecord.name}!`
        let templateFilePath  = path.join(config.app.rootDir, 'mailers', 'teams', 'request_access_confirm.pug')
        if (accessRecord.status === 'denied') {
          return // TODO determine if we want to send a deny e-mail or not
          // subject           = `${config.app.name}: Team access request to - ${teamRecord.name}`
          // templateFilePath  = path.join(config.app.rootDir, 'mailers', 'teams', 'request_access_deny.pug')
        }

        await mailer.send({
          to: requestUserEmail,
          subject: subject,
          html: await MailerHelpers.getTemplateHtml(templateFilePath, {
            host:     config.server.host,
            teamName: teamRecord.name
          })
        })
      }
    }
  }
}
