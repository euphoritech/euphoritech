import DatabaseModel from './DatabaseModel'

export default function TeamIntegrations(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_integrations')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'user_oauth_int_id', 'integration_type'
      ]
    }
  )
}
