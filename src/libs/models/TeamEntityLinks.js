import DatabaseModel from './DatabaseModel'

export default function TeamEntityLinks(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entity_links')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'entity1_id', 'entity2_id', 'status'
      ],

      async getLinkId(teamId, id1, id2) {
        const { rows } = await postgres.query(`
          select *
          from team_entity_links
          where
            team_id = $1 and
            (entity1_id = $2 or entity2_id = $2) and
            (entity1_id = $3 or entity2_id = $3)
        `, [ teamId, id1, id2 ])

        if (rows.length > 0)
          return parseInt(rows[0].id)

        return null
      },

      async findByEntity(teamId, entityId, status='active') {
        const { rows } = await postgres.query(`
          select
            e2.*,
            l.entity1_id,
            l.entity2_id
          from team_entities as e
          inner join team_entity_links as l on e.id = l.entity1_id or e.id = l.entity2_id
          inner join team_entities as e2 on e2.id <> $2 and (e2.id = l.entity1_id or e2.id = l.entity2_id)
          where e.team_id = $1 and e.id = $2 and l.status = $3
          order by lower(e2.name)
        `, [ teamId, entityId, status ])
        return rows
      }
    }
  )
}
