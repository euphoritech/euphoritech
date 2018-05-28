import DatabaseModel from './DatabaseModel'

export default function TeamEntityLinks(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entity_links')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'entity1_id', 'entity2_id'
      ],

      async getLinkId(id1, id2) {
        const { rows } = await postgres.query(`
          select *
          from team_entity_links
          where
            (entity1_id = $1 or entity2_id = $1) and
            (entity1_id = $2 or entity2_id = $2)
        `, [ id1, id2 ])

        if (rows.length > 0)
          return parseInt(rows[0].id)

        return null
      },

      async findByEntity(entityId) {
        const { rows } = await postgres.query(`
          select
            e2.*,
            l.entity1_id,
            l.entity2_id
          from team_entities as e
          inner join team_entity_links as l on e.id = l.entity1_id or e.id = l.entity2_id
          inner join team_entities as e2 on e2.id <> $1 and (e2.id = l.entity1_id or e2.id = l.entity2_id)
          where e.id = $1
          order by lower(e2.name)
        `, [ entityId ])
        return rows
      }
    }
  )
}
