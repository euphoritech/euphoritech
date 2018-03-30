import { handleFetchResponse } from './ApiHelpers'

export default {
  async setRedirect(targetUrl) {
    const response = await euphoritechFetch(`/api/1.0/auth/setRedirect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: targetUrl })
    })
    return await handleFetchResponse(response)
  },

  async getLoggedInUser() {
    const response = await euphoritechFetch(`/api/1.0/auth/session`)
    return await handleFetchResponse(response)
  },

  isLoggedInLocal(state) {
    return (state.isLoggedIn)
      return true
    return false
  },

  async getLoggedInUsersIntegrations() {
    const response = await euphoritechFetch(`/api/1.0/auth/getIntegrations`)
    return await handleFetchResponse(response)
  }
}
