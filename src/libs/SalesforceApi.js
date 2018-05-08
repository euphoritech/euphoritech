import jsforce from 'jsforce'
import UserOauthIntegrations from './models/UserOauthIntegrations'
import config from '../config'

const NOOP = () => {}

export default function SalesforceApi({ id, postgres }) {
  return {
    async connect(resetConnection=false) {
      if (this.connection && !resetConnection)
        return this.connection

      const oauthInstance = UserOauthIntegrations(postgres)
      const record = await oauthInstance.find(id)
      return this.connection = new jsforce.Connection({
        oauth2: {
          clientId: config.salesforce.appId,
          clientSecret: config.salesforce.appSecret,
          redirectUri: config.salesforce.loginCallbackUrl
        },
        instanceUrl: record.mod1,
        accessToken: record.access_token,
        refreshToken: record.refresh_token
      })
    },

    async attributes(sfdcObjectName, entireAttributeObject=false) {
      await this.connect()
      const info = await this.connection.describe(sfdcObjectName)

      // Only return name if we don't care about all the other
      // info for all objects.
      if (!entireAttributeObject)
        return info.fields.map(f => f.name)

      return info.fields
    },

    // https://jsforce.github.io/document/#using-soql
    async query(queryString, individualCallback=NOOP, maxFetch=5000) {
      return await new Promise((resolve, reject) => {
        const query = connection.query(queryString)
        .on("record", individualCallback)
        .on("end", () => resolve(query))
        .on("error", reject)
        .run({ autoFetch : true, maxFetch : maxFetch })
      })
    }
  }
}
