export default {
  APP_NO_LONGER_LOADING(state) {
    state.isLoading = false
  },

  SET_SESSION_INFO(state, { user, session, team_hierarchy, settings }) {
    state.auth.user       = Object.assign(state.auth.user || {}, user)
    state.session         = Object.assign(state.session || {}, session)
    state.settings        = Object.assign(state.settings || {}, settings)
    state.team_hierarchy  = Object.assign(state.team_hierarchy || {}, team_hierarchy)
    console.log('STATE', state)
  },

  TOGGLE_SETTINGS_MODAL(state) {
    state.settings.isOpen = !state.settings.isOpen
  }
}
