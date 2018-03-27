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

  isLoggedIn(state) {
    return (state.auth && state.auth.user && Object.keys(state.auth.user).length > 0)
      return true
    return false
  }
}
