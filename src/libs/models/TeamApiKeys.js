import DatabaseModel from './DatabaseModel'

export default function TeamApiKeys(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_api_keys')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'api_key', 'status'
      ]
    }
  )
}
