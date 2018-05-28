import Promise from 'bluebird'
import GithubApi from '../GithubApi'
import SessionHandler from '../SessionHandler'
import TeamEntities from '../models/TeamEntities'
import UserOauthIntegrations from '../models/UserOauthIntegrations'
import { sleep } from '../Helpers'

export default function Github({ app, socket, log, io, postgres, redis }) {
  const req       = socket.request
  const teamEnt   = TeamEntities(postgres)
  const userOauth = UserOauthIntegrations(postgres)
  const session   = SessionHandler(req.session)
  const teamId    = session.getCurrentLoggedInTeam()
  const userId    = session.getLoggedInUserId()
  const teamInt   = session.getLoggedInTeamIntegrations()
  const userInt   = session.getLoggedInUserIntegrations()

  const teamGithubInt = teamInt['github']

  return {
    async githubBulkRecordImportStart({ org, repo, recordType, entityTypeId }) {
      if (teamGithubInt) {
        const userIntegrationRecord = await userOauth.find(teamGithubInt.user_oauth_int_id)
        const api = GithubApi(userIntegrationRecord.access_token, org)
        await api.getRepo(repo, org)

        let pullRequests, issues
        switch(recordType) {
          case 'issue':
            issues = await api.repo.listIssues(repo)
            break
          case 'pr':
            pullRequests = await api.repo.listPullRequests()
            break
          default:      // both PRs and issues
            const [ prs, iss ] = await Promise.all([
              api.repo.listPullRequests(),
              api.repo.listIssues(repo)
            ])
            issues = iss
            pullRequests = prs
        }

        await Promise.each(pullRequests.data, async pr => {
          await sleep(300)
          await teamEnt.createOrUpdate(teamId, {
            source:         'github',
            entityTypeId:   entityTypeId,
            uid:            pr.id,
            name:           pr.title,
            description:    pr.body,
            external_link:  pr.html_url,
            mod1:           repo,
            mod2:           pr.number,
            mod3:           pr.url,
            mod4:           pr.user.login,
            mod5:           pr.closed_at,
            raw_info:       pr
          })
          socket.emit('githubBulkAddedRecord', { record: pr })
        })

        await Promise.each(issues.data, async issue => {
          await sleep(300)
          await teamEnt.createOrUpdate(teamId, {
            source:         'github',
            entityTypeId:   entityTypeId,
            uid:            issue.id,
            name:           issue.title,
            description:    issue.body,
            external_link:  issue.html_url,
            mod1:           repo,
            mod2:           issue.number,
            mod3:           issue.url,
            mod4:           issue.user.login,
            mod5:           issue.closed_at,
            raw_info:       issue
          })
          socket.emit('githubBulkAddedRecord', { record: issue })
        })

        socket.emit('githubBulkFinished')
      }
    }
  }
}
