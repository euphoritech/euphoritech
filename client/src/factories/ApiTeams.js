import { handleFetchResponse } from './ApiHelpers'

export default {
  async checkTeamAvailability(teamId) {
    const response = await euphoritechFetch(`/api/1.0/teams/team/available?teamId=${teamId}`)
    return await handleFetchResponse(response)
  },

  async checkTeamExists(teamId) {
    const response = await euphoritechFetch(`/api/1.0/teams/team/exists?teamId=${teamId}`)
    return await handleFetchResponse(response)
  },

  async getTeamHierarchy(teamId='') {
    const response = await euphoritechFetch(`/api/1.0/teams/hierarchy/get?teamId=${teamId}`)
    return await handleFetchResponse(response)
  },

  async newTeam({ teamId, teamName }) {
    const response = await euphoritechFetch(`/api/1.0/teams/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, teamName })
    })
    return await handleFetchResponse(response)
  },

  async requestJoinTeam({ teamId }) {
    const response = await euphoritechFetch(`/api/1.0/teams/team/join/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    })
    return await handleFetchResponse(response)
  },

  async getCurrentTeamIntegrations() {
    const response = await euphoritechFetch(`/api/1.0/teams/integrations/session/get`)
    return await handleFetchResponse(response)
  },

  async hasIntegration(type) {
    const response = await euphoritechFetch(`/api/1.0/teams/hasIntegration?type=${type}`)
    return await handleFetchResponse(response)
  },

  async getUsersInLoggedInTeam(page=1, pageSize=10) {
    const response = await euphoritechFetch(`/api/1.0/teams/users?page=${page}&pageSize=${pageSize}`)
    return await handleFetchResponse(response)
  },

  async getTeamEntityTypes() {
    const response = await euphoritechFetch(`/api/1.0/teams/types/get`)
    return await handleFetchResponse(response)
  },

  async getApiKeys() {
    const response = await euphoritechFetch(`/api/1.0/teams/api/keys/get`)
    return await handleFetchResponse(response)
  }
}
