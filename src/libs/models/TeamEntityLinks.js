import DatabaseModel from './DatabaseModel'

export default function TeamEntityLinks(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entity_links')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'entity1_id', 'entity2_id'
      ],

      async findByEntity(entityId, getEntitiesToo=false) {
        const { rows } = await postgres.query(`
          select e.*, l.*
          from team_entity_links as l
          inner join team_entities as e on e.id = l.entity1_id or e.id = l.entity2_id
          where e.id = $1
        `, [ entityId ])
        return rows
      }
    }
  )
}
