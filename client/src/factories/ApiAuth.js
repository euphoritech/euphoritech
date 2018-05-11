import { handleFetchResponse } from './ApiHelpers'

export default {
  async setRedirect(targetUrl) {
    const response = await euphoritechFetch(`/api/1.0/auth/redirect/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: targetUrl })
    })
    return await handleFetchResponse(response)
  },

  async setSession(key, data) {
    const response = await euphoritechFetch(`/api/1.0/auth/session/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    })
    return await handleFetchResponse(response)
  },

  async resetPassword({ current_password, new_password }) {
    const response = await euphoritechFetch(`/api/1.0/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password })
    })
    return await handleFetchResponse(response)
  },

  async getLoggedInUser() {
    const response = await euphoritechFetch(`/api/1.0/auth/session`)
    return await handleFetchResponse(response)
  },

  async checkUsernameAvailability(username) {
    const response = await euphoritechFetch(`/api/1.0/auth/usernameAvailable?username=${encodeURIComponent(username)}`)
    return await handleFetchResponse(response)
  },

  async getLoggedInUsersIntegrations() {
    const response = await euphoritechFetch(`/api/1.0/auth/integrations/get`)
    return await handleFetchResponse(response)
  },

  isValidEmail(text='') {
    return /^.+@.+\.([a-zA-Z\d]{2,5})$/.test(text)
  },

  isValidTeamId(id='') {
    return /^[a-z\d]{5,8}$/.test((id || '').toLowerCase())
  }
}
