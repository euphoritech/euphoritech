export default {
  APP_NO_LONGER_LOADING(state) {
    state.isLoading = false
  },

  SET_SESSION_INFO(state, { user, settings }) {
    state.auth.user = Object.assign(state.auth.user || {}, user)
    state.settings  = Object.assign(state.settings || {}, settings)
    console.log('STATE', state)
  },

  TOGGLE_SETTINGS_MODAL(state) {
    state.settings.isOpen = !state.settings.isOpen
  }
}
