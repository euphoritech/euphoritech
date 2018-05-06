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

    async getOrganization(userOrOrganization=userOrOrg) {
      return org = await client.getOrganization(userOrOrganization)
    },

    async getRepo(repo, userOrOrganization=userOrOrg) {
      return repo = await client.getRepo(userOrOrganization, repo)
    },

    org: {
      org,

      async listRepos() {
        return await org.getRepos()
      }
    },

    repo: {
      repo,

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#getDetails
      async getDetails() {
        return await repo.getDetails()
      },

      async getIssueOrPullRequest(id, repository, userOrOrganization) {
        repo = await client.getRepo(userOrOrganization, repository)

        const notFoundHandler = async (itemNum, which='issue') => {
          let result
          try {
            if (which === 'pr') {
              result = await this.getPullRequest(itemNum)
            } else { // 'issue'
              result = await this.getIssue(itemNum, repository, userOrOrganization)
            }

          } finally {
            return result || false
          }
        }

        return (await Promise.all([
          notFoundHandler(id, 'issue'),
          notFoundHandler(id, 'pr')
        ])).filter(r => !!r)[0]
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
      },

      // http://github-tools.github.io/github/docs/3.0.0/User.html#listOrgs
      async listRepos() {
        return await user.listRepos()
      }
    }
  }
}
