import { handleFetchResponse } from './ApiHelpers'

export default {
  async saveTeamIntegration({ type }) {
    const response = await euphoritechFetch(`/api/1.0/integrations/saveTeamIntegration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
    return await handleFetchResponse(response)
  }
}
