import GithubApi from '../GithubApi'
import SessionHandler from '../SessionHandler'
import UserOauthIntegrations from '../models/UserOauthIntegrations'

export default function Github({ app, socket, log, io, postgres, redis }) {
  const req     = socket.request
  const session = SessionHandler(req.session)
  const userId  = session.getLoggedInUserId()
  const teamInt = session.getLoggedInTeamIntegrations()
  const userInt = session.getLoggedInUserIntegrations()

  const teamGithubInt = teamInt['github']

  return {
    // async serverFetchPullRequests({ page }={}) {
    //
    // }
  }
}
