import { handleFetchResponse } from './ApiHelpers'

export default {
  async getTeamHierarchy(teamId='') {
    const response = await euphoritechFetch(`/api/1.0/teams/getCurrentHierarchy?teamId=${teamId}`)
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
    const response = await euphoritechFetch(`/api/1.0/teams/requestJoinTeam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    })
    return await handleFetchResponse(response)
  },

  async getCurrentTeamIntegrations() {
    const response = await euphoritechFetch(`/api/1.0/teams/getCurrentTeamIntegrations`)
    return await handleFetchResponse(response)
  }
}
