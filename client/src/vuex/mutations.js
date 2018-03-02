export default {
  SET_LOGGED_IN_USER(state, userObj) {
    state.user = userObj
    console.log('state.user', state.user)
  }
}
