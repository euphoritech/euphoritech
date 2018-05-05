import DatabaseModel from './DatabaseModel'

export default function TeamEntityTypes(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entity_types')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'type', 'is_active', 'description'
      ]
    }
  )
}
