import AuthFactory from '../factories/ApiAuth'
import SettingsFactory from '../factories/ApiSettings'

export default {
  async getSessionInfo({ commit }) {
    const [ user, settings ] = await Promise.all([
      AuthFactory.getLoggedInUser(),
      SettingsFactory.getStatus()
    ])
    commit('SET_SESSION_INFO', { user: user.session, settings: settings.status })
  },

  async toggleSettingsModal({ commit }) {
    commit('TOGGLE_SETTINGS_MODAL')
    await SettingsFactory.open()
  },

  redirectToLogin() {
    window.vueRouter.push('/login')
  }
}
