import nodemailer from 'nodemailer'
import PostgresClient from './PostgresClient'
import Users from './models/Users'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import config from '../config'

const postgres = new PostgresClient()

export default function Mailer(trasportConfig=config.mailer.transporterConfig) {
  return {
    transporter: nodemailer.createTransport(trasportConfig),

    async send(manualConfig={}) {
      // config needs from:, to:, subject:, and text: OR html: at a minimum
      // see usage here: https://nodemailer.com/usage/
      // see all options here: https://nodemailer.com/message/
      const mailOptions = Object.assign({ from: config.mailer.transporterConfig.auth.user }, manualConfig)
      return await this.transporter.sendMail(mailOptions)
    }
  }
}

export async function getDefaultConfig() {
  const users     = Users(postgres)
  const oauthInt  = UserOauthIntegrations(postgres)

  const userRecord  = await users.findBy({ username_email: 'lance@euphoritech.com' })
  const oauthRecord = await oauthInt.findBy({ user_id: userRecord.id, type: 'google' })
  return Object.assign(config.mailer.transporterConfig, {
    auth: {
      type: 'OAuth2',
      user: 'noreply@euphoritech.com',
      clientId: process.env.GOOGLE_APP_ID,
      clientSecret: process.env.GOOGLE_APP_SECRET,
      accessToken: oauthRecord.access_token,
      refreshToken: oauthRecord.refresh_token
    }
  })
}
