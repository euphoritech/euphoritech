import AuthFactory from '../factories/ApiAuth'
import ApiTeams from '../factories/ApiTeams'
import SettingsFactory from '../factories/ApiSettings'

export default {
  async init({ commit }) {
    const responses = await Promise.all([
      AuthFactory.getLoggedInUser(),
      AuthFactory.getLoggedInUsersIntegrations(),
      ApiTeams.getTeamHierarchy(),
      ApiTeams.getCurrentTeamIntegrations(),
      SettingsFactory.getStatus()
    ].map(p => p.catch(e => e)))

    const errors = responses.filter(r => (r instanceof Error))
    if (errors.length > 0)
      console.log("ERRORS", errors)

    const sessionInfo = responses[0]
    const usersInteg  = responses[1]
    const hierarchy   = responses[2]
    const teamInteg   = responses[3]
    const settings    = responses[4]

    commit('SET_SESSION_INFO', {
      user:               sessionInfo.session.user,
      user_integrations:  usersInteg.integrations,
      team_integrations:  teamInteg.integrations,
      session:            sessionInfo.session,
      team_hierarchy:     hierarchy,
      settings:           settings.status
    })
  },

  async toggleSettingsModal({ commit }) {
    commit('TOGGLE_SETTINGS_MODAL')
    await SettingsFactory.open()
  },

  redirectToHome() {
    window.vueRouter.push('/')
  },

  redirectToLogin() {
    window.vueRouter.push('/login')
  },

  redirectToNoTeamForm() {
    window.vueRouter.push('/autherror/noteam')
  }
}
