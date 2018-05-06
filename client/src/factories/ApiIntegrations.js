import { handleFetchResponse } from './ApiHelpers'

export default {
  async githubGetUserProfile() {
    const response = await euphoritechFetch(`/api/1.0/integrations/githubGetUserProfile`)
    return await handleFetchResponse(response)
  },

  async githubSearchRepos(searchText) {
    const response = await euphoritechFetch(`/api/1.0/integrations/githubSearchRepos?search=${searchText}`)
    return await handleFetchResponse(response)
  },

  async githubFindItemInRepo({ repo, num }) {
    const response = await euphoritechFetch(`/api/1.0/integrations/githubFindItemInRepo?repo=${repo}&num=${num}`)
    return await handleFetchResponse(response)
  },

  async saveTeamIntegration(obj) {
    const response = await euphoritechFetch(`/api/1.0/integrations/saveTeamIntegration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    })
    return await handleFetchResponse(response)
  }
}
