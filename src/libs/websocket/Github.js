import GithubApi from '../GithubApi'
import SessionHandler from '../SessionHandler'
import UserOauthIntegrations from '../models/UserOauthIntegrations'

export default function Global({ app, socket, log, io, postgres, redis }) {
  const req     = socket.request
  const session = SessionHandler(req.session)
  const userId  = session.getLoggedInUserId()
  const teamInt = session.getLoggedInTeamIntegrations()
  const userInt = session.getLoggedInUserIntegrations()

  const teamGithubInt = teamInt['github']

  return {
    async serverFetchPullRequests({ page }={}) {
      // if (!!teamGithubInt) {
      //   const userOauth = UserOauthIntegrations(postgres)
      //   page = page || 1
      //   const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
      //   const api = GithubApi(userIntegrationRecord.access_token)
      //   const prs = await api.listPullRequestsForRepo({ state: 'all', page }, 'useriq-com', 'useriq-app')
      //   socket.emit('clientReceivePullRequests', { results: prs.data })
      // } else {
      //   log.info(`No GitHub team integration found for user ID: ${userId}`)
      // }
    }
  }
}
