import fs from 'fs'
import path from 'path'
import util from 'util'
import pug from 'pug'
import nodemailer from 'nodemailer'
import PostgresClient from './PostgresClient'
import Users from './models/Users'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import config from '../config'

const readFile  = util.promisify(fs.readFile)
const postgres  = new PostgresClient()

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

export let MailerHelpers = {
  async getGmailConfig(userId=null) {
    const users     = Users(postgres)
    const oauthInt  = UserOauthIntegrations(postgres)

    let userRecord  = null
    if (userId) {
      userRecord  = await users.findBy({ id: userId })
    } else {
      userRecord  = await users.findBy({ username_email: 'lance@euphoritech.com' })
    }

    const oauthRecord = await oauthInt.findBy({ user_id: userRecord.id, type: 'google' })
    if (!oauthRecord)
      return await this.getGmailConfig()

    return Object.assign(config.mailer.transporterConfig, {
      auth: {
        type:         'OAuth2',
        user:         (userRecord.username_email === 'lance@euphoritech.com') ? /*'Euphoritech <noreply@euphoritech.com>'*/'noreply@euphoritech.com' : userRecord.username_email,
        clientId:     process.env.GOOGLE_APP_ID,
        clientSecret: process.env.GOOGLE_APP_SECRET,
        accessToken:  oauthRecord.access_token,
        refreshToken: oauthRecord.refresh_token
      }
    })
  },

  async getTemplateHtml(filePath, options={}) {
    const extension = path.extname(filePath)

    switch(extension) {
      case '.pug':
        return pug.renderFile(filePath, options)

      default:  // .html, meaning no compilation is needed
        return await readFile(filePath, { encoding: 'utf8' })
    }
  }
}
