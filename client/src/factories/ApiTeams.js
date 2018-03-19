export default {
  async getTeamHierarchy(teamId) {
    const response = await euphoritechFetch(`/api/1.0/teams/getCurrentHierarchy?teamId=${teamId}`)
    return response.json()
  }
}
