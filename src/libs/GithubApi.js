import GitHub from 'github-api'

export default function GithubApi(oauthToken, userOrOrganization=null) {
  let client    = new GitHub({ token: oauthToken })
  let userOrOrg = userOrOrganization
  let _user     = null
  let _org      = null
  let _repo     = null

  return {
    client,

    async getUser() {
      return _user = await client.getUser()
    },

    async getOrganization(userOrOrganization=userOrOrg) {
      return _org = await client.getOrganization(userOrOrganization)
    },

    async getRepo(repository, userOrOrganization=userOrOrg) {
      return _repo = await client.getRepo(userOrOrganization, repository)
    },

    org: {
      _org,

      async listRepos() {
        return await _org.getRepos()
      },

      // http://github-tools.github.io/github/docs/3.1.0/Organization.html#listMembers
      async listMembers() {
        return await _org.listMembers()
      }
    },

    repo: {
      _repo,

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#getDetails
      async getDetails() {
        return await _repo.getDetails()
      },

      async getIssueOrPullRequest(id, repository, userOrOrganization) {
        _repo = await client.getRepo(userOrOrganization, repository)

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
        return await _repo.getPullRequest(id)
      },

      // http://github-tools.github.io/github/docs/3.1.0/Repository.html#listPullRequests
      async listPullRequests(options={ state: 'all' }) {
        return await _repo.listPullRequests(options)
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
      _user,

      // http://github-tools.github.io/github/docs/3.1.0/User.html#getEmails
      async getEmails() {
        return await _user.getEmails()
      },

      async getProfile() {
        return await _user.getProfile()
      },

      // http://github-tools.github.io/github/docs/3.0.0/User.html#listOrgs
      async listOrgs() {
        return await _user.listOrgs()
      },

      // http://github-tools.github.io/github/docs/3.0.0/User.html#listOrgs
      async listRepos() {
        return await _user.listRepos()
      }
    }
  }
}
