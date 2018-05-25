import DatabaseModel from './DatabaseModel'

export default function TeamEntities(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entities')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'status', 'name', 'description', 'source', 'entity_type_id',
        'uid', 'external_link', 'due_date', 'mod1', 'mod2', 'mod3', 'mod4', 'mod5'
      ],

      async createOrUpdate(teamId, entityRecord) {
        const existingRecord = await this.findBy({
          team_id:        teamId,
          source:         entityRecord.source,
          entity_type_id: entityRecord.entityTypeId,
          uid:            entityRecord.uid
        })

        if (existingRecord)
          this.setRecord(existingRecord)

        this.setRecord({
          team_id:        teamId,
          name:           entityRecord.name,
          description:    entityRecord.description,
          source:         entityRecord.source,
          entity_type_id: entityRecord.entityTypeId,
          uid:            entityRecord.uid,
          external_link:  entityRecord.external_link,
          due_date:       entityRecord.dueDate,
          mod1:           entityRecord.mod1,
          mod2:           entityRecord.mod2,
          mod3:           entityRecord.mod3,
          mod4:           entityRecord.mod4,
          mod5:           entityRecord.mod5
        })
        return await this.save()
      },

      async findByTypeId(teamId, typeId, status='active', { page, pageSize, searchFilter, orderBy } = {}) {
        page = page || 1
        pageSize = pageSize || 30
        searchFilter = searchFilter || null
        orderBy = orderBy || 'lower(e.name)'

        let queryParams = [ teamId, typeId, orderBy, pageSize, (page-1) * pageSize ]
        let additionalSearchFilter = ''
        if (status) {
          if (status instanceof Array) {
            // TODO handle if multiple statuses are provided as array
          } else {
            additionalSearchFilter = `${additionalSearchFilter} and e.status = '${status.replace("'", "''")}'`
          }
        }

        if (searchFilter)
          additionalSearchFilter = `and e.name ilike '%${searchFilter}%'`

        const { rows } = await postgres.query(`
          select e.*
          from team_entity_types as t
          inner join team_entities as e on e.team_id = t.team_id and e.entity_type_id = t.id
          where t.team_id = $1 and
          t.id = $2 ${additionalSearchFilter}
          order by $3
          limit $4
          offset $5
        `, queryParams)
        return rows
      },

      seedTypes: [
        { name: 'Customer', description: 'Your customers or clients.' },
        { name: 'Customer User', description: 'Users that belong to your customers or clients.' },
        { name: 'Development Code Update', description: 'A version control commit.' },
        { name: 'Development Pull Request', description: 'A version control pull request.' },
        { name: 'QA Note', description: 'A bug or feature request or other requested code change.' },
        { name: 'Release Note', description: 'Documentation about a code update or release to describe new or changed functionality.' },
        { name: 'Support Ticket', description: 'Tickets submitted by your customers as support requests.' }
      ],

      async insertSeedTypes(teamId) {
        return await Promise.all(
          this.seedTypes.map(async info => {
            return await postgres.query(`
              insert into team_entity_types
              (team_id, name, description)
              values
              ($1, $2, $3)
            `, [ teamId, info.name, info.description ])
          })
        )
      }
    }
  )
}
