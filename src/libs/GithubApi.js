import GitHub from 'github-api'

export default function GithubApi(oauthToken, userOrOrganization=null) {
  let client    = new GitHub({ token: oauthToken })
  let userOrOrg = userOrOrganization
  let user      = null
  let org       = null
  let repo      = null

  return {
    client,

    async getUser() {
      return user = await client.getUser()
    },

    async getOrganization(org=userOrOrg) {
      return org = await client.getOrganization(org)
    },

    async getRepo(repo, userOrOrg=userOrOrg) {
      return repo = await client.getRepo(userOrOrg, repo)
    },

    org: {
      org,

      async getRepos(org=org) {
        return await org.getRepos()
      }
    },

    repo: {
      repo,

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#getDetails
      async getDetails() {
        return await repo.getDetails()
      },

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#getPullRequest
      async getPullRequest(id) {
        return await repo.getPullRequest(id)
      },

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#listPullRequests
      async listPullRequests(options={ state: 'all' }) {
        return await repo.listPullRequests(options)
      },

      // http://github-tools.github.io/github/docs/3.1.0/Issue.html#listIssues
      async listIssues(repo, options={ state: 'open' }, userOrOrganization=userOrOrg) {
        const issueInst = await client.getIssues(userOrOrganization, repo)
        return await issueInst.listIssues(options)
      },

      // http://github-tools.github.io/github/docs/3.1.0/Search.html#forIssues
      async searchIssues(queryString, repo, userOrOrganization=userOrOrg) {
        const q       = `${queryString} repo:${userOrOrganization}/${repo}`
        const search  = await client.search({})
        return await search.forIssues({ q, sort: 'created', order: 'desc' })
      },

      async getIssue(id, repo, userOrOrganization=userOrOrg) {
        const issueInst = await client.getIssues(userOrOrganization, repo)
        return await issueInst.getIssue(id)
      }
    },

    user: {
      user,

      // http://github-tools.github.io/github/docs/3.1.0/User.html#getEmails
      async getEmails() {
        return await user.getEmails()
      },

      async getProfile() {
        return await user.getProfile()
      },

      // http://github-tools.github.io/github/docs/3.0.0/User.html#listOrgs
      async listOrgs() {
        return await user.listOrgs()
      }
    }
  }
}
