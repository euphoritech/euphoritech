import AuthFactory from '../factories/ApiAuth'

export default {
  async getLoggedInUser({ commit }) {
    const info = await AuthFactory.getLoggedInUser()
    commit('SET_LOGGED_IN_USER', info.session)
  }
}
