export default function SessionHandler(session) {
  return {
    getCurrentLoggedInTeam() {
      if (session.current_team)
        return session.current_team.id

      return null
    }
  }
}