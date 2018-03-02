export default {
  async loginOrCreateAccount(username, password, shouldCreate=false) {
    const response = await euphoritechFetch(`/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        create: shouldCreate
      })
    })
    return response.json()
  },

  async getLoggedInUser() {
    const response = await euphoritechFetch(`/api/session`)
    return response.json()
  }
}
