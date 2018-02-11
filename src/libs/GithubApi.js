import octokitRest from '@octokit/rest'

export default function GithubApi(oauthToken, owner=null, repo=null) {
  const client = octokitRest()
  if (oauthToken)
    client.authenticate({ type: 'oauth', token: oauthToken })

  return {
    client,

    auth(oauthToken) {
      return this.client.authenticate({ type: 'oauth', token: oauthToken })
    },

    async listOrgRepos(org) {
      return await this.client.repos.getForOrg({ org })
    },

    // https://octokit.github.io/rest.js/#api-Issues-getForRepo
    async listIssuesForRepo(obj={}, adhocOwner=null, adhocRepo=null) {
      const owner = adhocOwner || owner
      const repo  = adhocRepo || repo
      return await this.client.issues.getForRepo(Object.assign({ owner, repo }, obj))
    },

    // https://octokit.github.io/rest.js/#api-Issues-getForUser
    async listIssuesForUser(obj={}) {
      return await this.client.issues.getForUser(obj)
    },

    async issue(number, adhocOwner=null, adhocRepo=null) {
      const owner = adhocOwner || owner
      const repo  = adhocRepo || repo
      return await this.client.issues.get({ owner, repo, number })
    },

    // https://octokit.github.io/rest.js/#api-PullRequests-getAll
    async listPullRequestsForRepo(obj={}, adhocOwner=null, adhocRepo=null) {
      const owner = adhocOwner || owner
      const repo  = adhocRepo || repo
      return await this.client.pullRequests.getAll(Object.assign({ owner, repo }, obj))
    },

    // https://octokit.github.io/rest.js/#api-PullRequests-get
    async pullRequest(number, adhocOwner=null, adhocRepo=null) {
      const owner = adhocOwner || owner
      const repo  = adhocRepo || repo
      return await this.client.pullRequests.get({ owner, repo, number })
    },

    // https://octokit.github.io/rest.js/#api-PullRequests-getComments
    async pullRequestComments(number, obj={}, adhocOwner=null, adhocRepo=null) {
      const owner = adhocOwner || owner
      const repo  = adhocRepo || repo
      return await this.client.pullRequests.getComments(Object.assign({ owner, repo, number }, obj))
    }
  }
}
