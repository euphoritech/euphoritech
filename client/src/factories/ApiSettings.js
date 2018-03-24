import { handleFetchResponse } from './ApiHelpers'

export default {
  async getStatus() {
    const response = await euphoritechFetch(`/api/1.0/settings/status`)
    return await handleFetchResponse(response)
  },

  async close() {
    const response = await euphoritechFetch(`/api/1.0/settings/close`)
    return await handleFetchResponse(response, null)
  },

  async open(section) {
    const response = await euphoritechFetch(`/api/1.0/settings/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: section })
    })
    return await handleFetchResponse(response, null)
  }
}
