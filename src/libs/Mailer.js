import nodemailer from 'nodemailer'
import config from '../config'

export default function Mailer(trasportConfig=config.mailer.transporterConfig) {
  return {
    transporter: nodemailer.createTransport(trasportConfig),

    async send(config={}) {
      // config needs from:, to:, subject:, and text: OR html: at a minimum
      // see usage here: https://nodemailer.com/usage/
      // see all options here: https://nodemailer.com/message/
      const mailOptions = Object.assign({ from: config.mailer.auth.user }, config)
      return await this.transporter.sendMail(mailOptions)
    }
  }
}
