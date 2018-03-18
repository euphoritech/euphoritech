export default {
  async getStatus() {
    const response = await euphoritechFetch(`/api/1.0/settings/status`)
    return response.json()
  },

  async close() {
    await euphoritechFetch(`/api/1.0/settings/close`)
  },

  async open(section) {
    await euphoritechFetch(`/api/1.0/settings/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: section })
    })
  }
}
