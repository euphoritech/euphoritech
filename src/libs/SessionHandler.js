import moment from 'moment'

export default function SessionHandler(session, { redis } = {}) {
  return {
    getCurrentLoggedInTeam() {
      if (session.current_team)
        return session.current_team.id

      return null
    },

    getLoggedInUserId(fullRecord=false) {
      if (session && session.user)
        return (fullRecord) ? session.user : session.user.id

      return null
    },

    getLoggedInTeamIntegrations() {
      if (session && session.current_team_integrations)
        return session.current_team_integrations

      return {}
    },

    getLoggedInUserIntegrations() {
      if (session && session.user_integrations)
        return session.user_integrations

      return {}
    },

    async checkIfShouldRefreshSession(teamId) {
      const currentTeamId = this.getCurrentLoggedInTeam()
      const currentUser   = this.getLoggedInUserId(true)

      if (teamId) {
        const lastSessionRefreshTime = await redis.get(`team_session_refresh_${currentTeamId}`)
        if (!lastSessionRefreshTime || !currentUser.last_session_refresh || moment(lastSessionRefreshTime).isAfter(moment(currentUser.last_session_refresh)))
          return true
      }
      return false
    },

    async resetTeamSessionRefresh(teamId, timestamp=moment().toISOString()) {
      await redis.set(`team_session_refresh_${teamId}`, timestamp, 'EX', 86400)
      return true
    },

    setSession(object, sessionObj=session) {
      if (session && sessionObj) {
        for (var _key in object) {
          if (object[_key] && object[_key].toString() === '[object Object]') {
            sessionObj[_key] = sessionObj[_key] || {}
            this.setSession(object[_key], sessionObj[_key])
          } else {
            sessionObj[_key] = object[_key]
          }
        }

        session.save()
        return true
      }
      return false
    }
  }
}
