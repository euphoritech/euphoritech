import GithubApi from '../../../GithubApi'
import SalesforceApi from '../../../SalesforceApi'
import SessionHandler from '../../../SessionHandler'
import TeamIntegrations from '../../../models/TeamIntegrations'
import TeamIntegrationsSalesforce from '../../../models/TeamIntegrationsSalesforce'
import UserOauthIntegrations from '../../../models/UserOauthIntegrations'

export default {
  async ['github/user']({ req, res, postgres }) {
    const session = SessionHandler(req.session)
    const userId  = session.getLoggedInUserId()
    const userInt = session.getLoggedInUserIntegrations()

    const userGithubInt = userInt['github']
    if (userGithubInt) {
      const api = GithubApi(userGithubInt.access_token)
      await api.getUser()
      const userInfo = await api.user.getProfile()
      res.json({ profile: userInfo.data })
    } else {
      res.status(400).json({ error: res.__(`You don't have a GitHub integration yet.`) })
    }
  },

  async ['github/repos/search']({ req, res, postgres }) {
    const searchText  = req.query.search
    const session     = SessionHandler(req.session)
    const userId      = session.getLoggedInUserId()
    const teamInt     = session.getLoggedInTeamIntegrations()
    const userInt     = session.getLoggedInUserIntegrations()

    const teamGithubInt = teamInt['github']
    if (teamGithubInt) {
      const userOauth = UserOauthIntegrations(postgres)
      const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
      const api = GithubApi(userIntegrationRecord.access_token)

      if (teamGithubInt.mod2 === 'org')
        await api.getOrganization(teamGithubInt.mod1)
      if (teamGithubInt.mod2 === 'user')
        await api.getUser()

      const repos = await api[teamGithubInt.mod2 || 'org'].listRepos()
      const filteredRepos = repos.data.filter(r => (new RegExp(`.*${searchText}.*`, 'i')).test(r.name))
      res.json({ results: filteredRepos })
    } else {
      res.status(400).json({ error: res.__(`No GitHub team integration found for your user ID`) })
    }
  },

  async ['github/orgs/search']({ req, res, postgres }) {
    const session     = SessionHandler(req.session)
    const userId      = session.getLoggedInUserId()
    const teamInt     = session.getLoggedInTeamIntegrations()
    const userInt     = session.getLoggedInUserIntegrations()
    const searchText  = req.query.search

    const teamGithubInt = teamInt['github']
    if (!!teamGithubInt) {
      const userOauth = UserOauthIntegrations(postgres)
      const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
      const api = GithubApi(userIntegrationRecord.access_token)
      await api.getUser()
      const organizations = await api.user.listOrgs()
      let results = organizations.data
      if (searchText)
        results = results.filter(org => (new RegExp(`.*${searchText}.*`, 'i')).test(org.login))

      res.json({ results })
    } else {
      res.status(400).json({ error: res.__(`No GitHub team integration found for your user ID`) })
    }
  },

  async ['github/item/find']({ req, res, postgres }) {
    const session     = SessionHandler(req.session)
    const userId      = session.getLoggedInUserId()
    const teamInt     = session.getLoggedInTeamIntegrations()
    const repo        = req.query.repo
    const number      = req.query.num

    const teamGithubInt = teamInt['github']
    if (!!teamGithubInt) {
      const userOauth = UserOauthIntegrations(postgres)
      const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
      const api = GithubApi(userIntegrationRecord.access_token)
      const itemInfo = await api.repo.getIssueOrPullRequest(number, repo, teamGithubInt.mod1)

      if (!itemInfo)
        return res.status(404).json({ error: res.__("No issue or PR with the ID provided.") })

      return res.json({ result: itemInfo.data })
    } else {
      res.status(400).json({ error: res.__(`No GitHub team integration found for your user ID`) })
    }
  },

  async ['salesforce/objects/get']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const integrations  = session.getLoggedInTeamIntegrations()
    const searchText    = req.query.search

    let objectNames = []
    if (integrations && integrations.salesforce) {
      if (integrations.salesforce.objects) {
        objectNames = integrations.salesforce.objects
      } else {
        const userIntegrationid = integrations.salesforce.user_oauth_int_id
        const api = SalesforceApi({ id: userIntegrationid, postgres })
        objectNames = await api.objects()

        // Set in the session for caching later until session is reset
        session.setSession({ objects: objectNames }, integrations.salesforce)
      }

      if (searchText)
        objectNames = objectNames.filter(n => (new RegExp(`.*${searchText}.*`, 'i')).test(n))
    }

    res.json({ objects: objectNames })
  },

  async ['salesforce/attributes/get']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const integrations  = session.getLoggedInTeamIntegrations()
    const objectName    = req.query.object
    const searchText    = req.query.search

    let attributes = []
    if (integrations && integrations.salesforce) {
      if (integrations.salesforce.object && integrations.salesforce.object[objectName]) {
        attributes = integrations.salesforce.object[objectName]
      } else {
        const userIntegrationid = integrations.salesforce.user_oauth_int_id
        const api = SalesforceApi({ id: userIntegrationid, postgres })
        attributes = await api.objectAttributes(objectName)

        // Set in the session for caching later until session is reset
        session.setSession({ object: { [objectName]: attributes }}, integrations.salesforce)
      }

      if (searchText)
        attributes = attributes.filter(n => (new RegExp(`.*${searchText}.*`, 'i')).test(n))
    }

    res.json({ attributes })
  },

  async ['salesforce/records/get']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const sfdcInst      = TeamIntegrationsSalesforce(postgres)
    const integrations  = session.getLoggedInTeamIntegrations()
    const sfdcIntId     = req.query.int_id
    const searchText    = req.query.search

    let records = []
    if (integrations && integrations.salesforce) {
      const userIntegrationid = integrations.salesforce.user_oauth_int_id
      const api = SalesforceApi({ id: userIntegrationid, postgres })
      const instRecord = await sfdcInst.find(sfdcIntId)
      const foundRecords = await api.search(instRecord.object_name, searchText)

      await api.query(`
        select ${Object.values(instRecord.attribute_info).filter(a => !!a)}
        from ${instRecord.object_name}
        where Id in ('${foundRecords.map(r => r.Id).join("','")}')
      `, rec => records.push(rec))
    }

    res.json({ records })
  },

  async ['salesforce/team/objects/get']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const sfdcInst      = TeamIntegrationsSalesforce(postgres)
    const searchText    = req.query.search

    let records = await sfdcInst.getAllBy({ team_id: currentTeamId })
    if (searchText)
      records = records.filter(int => (new RegExp(`.*${searchText}.*`, 'i')).test(int.object_name))

    res.json({ records })
  },

  async ['salesforce/team/objects/save']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const sfdcInst      = TeamIntegrationsSalesforce(postgres)
    const recordId      = req.body.id
    const objectName    = req.body.object
    const attrInfo      = req.body.attrs

    if (recordId) {
      const record = await sfdcInst.findBy({ team_id: currentTeamId, id: recordId })
      sfdcInst.setRecord(record || {})
    }

    sfdcInst.setRecord({ team_id: currentTeamId, object_name: objectName, attribute_info: attrInfo })
    await sfdcInst.save()
    return res.json(true)
  },

  async ['team/save']({ req, res, postgres, redis }) {
    const sessionHandler  = SessionHandler(req.session, { redis })
    const integrations    = TeamIntegrations(postgres)
    const currentTeamId   = sessionHandler.getCurrentLoggedInTeam()
    const currentUserId   = sessionHandler.getLoggedInUserId()
    const userInteg       = sessionHandler.getLoggedInUserIntegrations()
    const teamInteg       = sessionHandler.getLoggedInTeamIntegrations()
    const intType         = req.body.type
    const defaultOrg      = req.body.org
    const orgType         = req.body.orgType
    const onlyUpdateOrg   = req.body.onlyUpdateOrg

    let integration = userInteg[intType]
    let userIntegrationId = integration.id
    if (onlyUpdateOrg) {
      integration = teamInteg[intType]
      userIntegrationId = integration.user_oauth_int_id
    }

    if (integration) {
      await integrations.findOrCreateBy({ team_id: currentTeamId, integration_type: intType })
      integrations.setRecord({ user_oauth_int_id: userIntegrationId, mod1: defaultOrg, mod2: orgType })
      const newId = await integrations.save()
      await sessionHandler.resetTeamSessionRefresh(currentTeamId)

      return res.json({ id: newId })
    }

    res.status(404).json({ error: res.__(`We could not find your integration. Make sure you've authenticated and try again.`) })
  }
}
