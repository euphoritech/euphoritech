import { handleFetchResponse } from './ApiHelpers'

export default {
  // async loginOrCreateAccount(username, password, shouldCreate=false) {
  //   const response = await euphoritechFetch(`/api/1.0/auth/login`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       username: username,
  //       password: password,
  //       create: shouldCreate
  //     })
  //   })
  //   return response.json()
  // },

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
