import GithubApi from '../../../GithubApi'
import SessionHandler from '../../../SessionHandler'
import TeamIntegrations from '../../../models/TeamIntegrations'
import UserOauthIntegrations from '../../../models/UserOauthIntegrations'

export default {
  async githubGetUserProfile({ req, res, postgres }) {
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

  async githubSearchRepos({ req, res, postgres }) {
    const search  = req.query.search
    console.log("SEARCHTEXT", search)
    const session = SessionHandler(req.session)
    const userId  = session.getLoggedInUserId()
    const teamInt = session.getLoggedInTeamIntegrations()
    const userInt = session.getLoggedInUserIntegrations()

    const teamGithubInt = teamInt['github']

    if (teamGithubInt) {
      const userOauth = UserOauthIntegrations(postgres)
      const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
      const api = GithubApi(userIntegrationRecord.access_token)
      // const prs = await api.listPullRequestsForRepo({ state: 'all', page }, 'useriq-com', 'useriq-app')
      const prs = await api.listOrgRepos('useriq-com')
      res.json({ results: prs.data })
    } else {
      res.status(400).json({ error: res.__(`No GitHub team integration found for your user ID`) })
    }
  },

  async githubSearchForOrgs({ req, res, postgres }) {
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

  async saveTeamIntegration({ req, res, postgres, redis }) {
    const sessionHandler  = SessionHandler(req.session, { redis })
    const integrations    = TeamIntegrations(postgres)
    const currentTeamId   = sessionHandler.getCurrentLoggedInTeam()
    const currentUserId   = sessionHandler.getLoggedInUserId()
    const userInteg       = sessionHandler.getLoggedInUserIntegrations()
    const teamInteg       = sessionHandler.getLoggedInTeamIntegrations()
    const intType         = req.body.type
    const defaultOrg      = req.body.org
    const onlyUpdateOrg   = req.body.onlyUpdateOrg

    const integration = (onlyUpdateOrg) ? teamInteg[intType] : userInteg[intType]

    if (integration) {
      await integrations.findOrCreateBy({ team_id: currentTeamId, integration_type: intType })
      integrations.setRecord({ user_oauth_int_id: integration.id, mod1: defaultOrg })
      const newId = await integrations.save()
      await sessionHandler.resetTeamSessionRefresh(currentTeamId)

      return res.json({ id: newId })
    }

    res.status(404).json({ error: res.__(`We could not find your integration. Make sure you've authenticated and try again.`) })
  }
}
