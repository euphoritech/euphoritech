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

  chatWidget: {
    isOpen: false
  },

  dataLabelMaps: {
    github: {
      uid: 'Unique ID',
      name: 'Title',
      description: 'Description',
      external_link: 'External Link',
      // dueDate: 'Due Date',
      mod1: 'Repository',
      mod2: 'Number',
      mod3: 'API Link',
      mod4: 'User Created',
      mod5: 'Closed At'
    },

    manual: {
      uid: 'Unique ID',
      name: 'Name',
      description: 'Description',
      // dueDate: 'Due Date',
      mod1: 'Extra Parameter 1',
      mod2: 'Extra Parameter 2',
      mod3: 'Extra Parameter 3',
      mod4: 'Extra Parameter 4',
      mod5: 'Extra Parameter 5'
    },

    salesforce: {
      uid: 'Unique Identifier',
      name: 'Name',
      description: 'Description',
      external_link: 'External Link',
      due_date: 'Due Date',
      mod1: 'Extra Parameter 1',
      mod2: 'Extra Parameter 2',
      mod3: 'Extra Parameter 3',
      mod4: 'Extra Parameter 4',
      mod5: 'Extra Parameter 5'
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
