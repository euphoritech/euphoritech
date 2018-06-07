import path from 'path'
import Mailer, { MailerHelpers } from '../Mailer'
import Teams from '../models/Teams'
import Users from '../models/Users'
import config from '../../config'

export default function TeamWorkers(options={}) {
  const postgres  = options.postgres
  const teams     = Teams(postgres)
  const users     = Users(postgres)

  return {
    forgotPasswordMailer: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async options => {
        const mailerConfig  = await MailerHelpers.getGmailConfig()
        const mailer        = Mailer(mailerConfig)

        await mailer.send({
          to: options.user_email,
          subject: `${config.app.name}: Temporary Password`,
          html: await MailerHelpers.getTemplateHtml(path.join(config.app.rootDir, 'mailers', 'auth', 'forgot_password.pug'), Object.assign({ host: config.server.host }, options))
        })
      }
    }
  }
}
