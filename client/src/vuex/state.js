export default {
  isLoading: true,
  isLoggedIn: false,
  showEntityModal: false,

  auth: {
    user: {
      // Holds the authenticated users primary info (name, email, etc.)
    },

    user_integrations: {
      // Holds all the integrations that the authenticated
      // user has integrated with
      // key/value pair of [type]: integration
    },

    team_integrations: {
      // Holds all the integrations that the authenticated
      // user's current team has integrated with
      // key/value pair of [type]: integration
    }
  },

  session: {
    // An object with the entire session object stored
    entities: {
      dashboard: {
        accordion: {
          visibility: {
            overview: true,
            records: false
          }
        }
      }
    },
  },

  settings: {
    isOpen: false
  }
}
