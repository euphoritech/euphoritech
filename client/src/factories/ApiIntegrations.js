import { handleFetchResponse } from './ApiHelpers'

export default {
  async githubGetUserProfile() {
    const response = await euphoritechFetch(`/api/1.0/integrations/github/user`)
    return await handleFetchResponse(response)
  },

  async githubGetUserIssues(repo, user='me') {
    const response = await euphoritechFetch(`/api/1.0/integrations/github/user/issues/find?repo=${repo}&user=${user}`)
    return await handleFetchResponse(response)
  },

  async githubSearchRepos(searchText, org='') {
    const response = await euphoritechFetch(`/api/1.0/integrations/github/repos/search?search=${searchText}&org=${org}`)
    return await handleFetchResponse(response)
  },

  async githubOrgMembers() {
    const response = await euphoritechFetch(`/api/1.0/integrations/github/orgs/members`)
    return await handleFetchResponse(response)
  },

  async githubFindItemInRepo({ repo, num }) {
    const response = await euphoritechFetch(`/api/1.0/integrations/github/item/find?repo=${repo}&num=${num}`)
    return await handleFetchResponse(response)
  },

  async getSfdcObjects({ search }={}) {
    const response = await euphoritechFetch(`/api/1.0/integrations/salesforce/objects/get?search=${search}`)
    return await handleFetchResponse(response)
  },

  async getSfdcRecords({ id, search }={}) {
    const response = await euphoritechFetch(`/api/1.0/integrations/salesforce/records/get?int_id=${id}&search=${search}`)
    return await handleFetchResponse(response)
  },

  async getSfdcObjectsFromTeamIntegration() {
    const response = await euphoritechFetch(`/api/1.0/integrations/salesforce/team/objects/get`)
    return await handleFetchResponse(response)
  },

  async saveSfdcObjectAndAttributesIntegration(obj) {
    const response = await euphoritechFetch(`/api/1.0/integrations/salesforce/team/objects/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    })
    return await handleFetchResponse(response)
  },

  async saveTeamIntegration(obj) {
    const response = await euphoritechFetch(`/api/1.0/integrations/team/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    })
    return await handleFetchResponse(response)
  }
}
