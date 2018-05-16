import DatabaseModel from './DatabaseModel'

export default function TeamIntegrationsSalesforce(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_integrations_salesforce')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'team_integrations_id', 'object_name', 'attribute_info'
      ]
    }
  )
}
