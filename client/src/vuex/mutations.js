export default {
  APP_NO_LONGER_LOADING(state) {
    state.isLoading = false
  },

  SET_LOGGED_IN_USER(state, userObj) {
    state.auth.user = userObj
    console.log('state.auth.user', state.auth.user)
  }
}
