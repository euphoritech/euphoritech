import Promise from 'bluebird'
import SalesforceApi from '../SalesforceApi'
import SessionHandler from '../SessionHandler'
import TeamEntities from '../models/TeamEntities'
import TeamIntegrationsSalesforce from '../models/TeamIntegrationsSalesforce'
import UserOauthIntegrations from '../models/UserOauthIntegrations'
import { sleep } from '../Helpers'

export default function Salesforce({ app, socket, log, io, postgres, redis }) {
  const req       = socket.request
  const teamEnt   = TeamEntities(postgres)
  const sfdcInst  = TeamIntegrationsSalesforce(postgres)
  const userOauth = UserOauthIntegrations(postgres)
  const session   = SessionHandler(req.session)
  const teamId    = session.getCurrentLoggedInTeam()
  const userId    = session.getLoggedInUserId()
  const teamInt   = session.getLoggedInTeamIntegrations()
  const userInt   = session.getLoggedInUserIntegrations()

  const teamGithubInt = teamInt['salesforce']

  return {
    async salesforceBulkRecordImportStart({ entityTypeId, integrationId }) {
      if (teamGithubInt) {
        const [ sfdcRecord, userIntegrationRecord ] = await Promise.all([
          sfdcInst.find(integrationId),
          userOauth.find(teamGithubInt.user_oauth_int_id)
        ])

        const api = SalesforceApi({ id: userIntegrationRecord.id, postgres })

        const columns = Object.values(sfdcRecord.attribute_info).filter(a => !!a)
        let records = []
        await api.query(`select ${columns.join(',')} from ${sfdcRecord.object_name}`, async rec => records.push(rec))
        await Promise.each(
          records.map(async rec => {
            await sleep(300)
            let info = { source: 'salesforce', entityTypeId, raw_info: rec }
            Object.keys(sfdcRecord.attribute_info).forEach(col => info[col] = (sfdcRecord.attribute_info[col]) ? rec[ sfdcRecord.attribute_info[col] ] : null)
            await teamEnt.createOrUpdate(teamId, info)
            socket.emit('salesforceBulkAddedRecord', { record: rec })
          })
        )

        socket.emit('salesforceBulkFinished')
      }
    }
  }
}
