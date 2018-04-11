export default {
  APP_NO_LONGER_LOADING(state) {
    state.isLoading = false
  },

  CHECK_LOGGED_IN(state, isLoggedIn) {
    state.isLoggedIn = isLoggedIn
  },

  SET_SESSION_INFO(state, {
    user,
    user_integrations,
    team_integrations,
    session,
    team_hierarchy,
    settings
  }) {
    state.auth.user               = Object.assign(state.auth.user || {}, user)
    state.auth.user_integrations  = Object.assign(state.user_integrations || {}, user_integrations)
    state.auth.team_integrations  = Object.assign(state.team_integrations || {}, team_integrations)
    state.session                 = Object.assign(state.session || {}, session)
    state.settings                = Object.assign(state.settings || {}, settings)
    state.team_hierarchy          = Object.assign(state.team_hierarchy || {}, team_hierarchy)
    console.log('STATE', state)
  },

  TOGGLE_CREATE_ENTITY_MODAL(state) {
    state.showEntityModal = !state.showEntityModal
  },

  TOGGLE_SETTINGS_MODAL(state) {
    state.settings.isOpen = !state.settings.isOpen
  }
}
