import DatabaseModel from './DatabaseModel'

export default function TeamIntegrations(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_integrations')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'user_oauth_int_id', 'integration_type',
        'mod1', 'mod2', 'mod3', 'mod4', 'mod5'
      ],

      // TODO evaluate the respective info we need based on integration
      // type here. For example, for type of 'github', mod1 and mod2 will
      // be organization and repo names respectively
      async evaluate() {

      }
    }
  )
}
