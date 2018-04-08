import DatabaseModel from './DatabaseModel'

export default function TeamEntities(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_entities')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'source', 'entity_type', 'uid', 'external_link',
        'due_date', 'mod1', 'mod2', 'mod3', 'mod4', 'mod5'
      ],

      seedTypes: [
        { internal_type: 'customer', external_type: 'Customer', description: 'Your customers or clients.' },
        { internal_type: 'customers_user', external_type: 'Customer Users', description: 'Users that belong to your customers or clients.' },
        { internal_type: 'development_code_update', external_type: 'Development Code Update', description: 'A version control commit.' },
        { internal_type: 'development_pull_request', external_type: 'Development Pull Request', description: 'A version control pull request.' },
        { internal_type: 'qa_note', external_type: 'QA Note', description: 'A bug or feature request or other requested code change.' },
        { internal_type: 'release_note', external_type: 'Release Note', description: 'Documentation about a code update or release to describe new or changed functionality.' },
        { internal_type: 'support_ticket', external_type: 'Support Ticket', description: 'Tickets submitted by your customers as support requests.' }
      ],

      async insertSeedTypes(teamId) {
        return await Promise.all(
          this.seedTypes.map(async info => {
            return await postgres.query(`
              insert into team_entity_types
              (team_id, internal_type, external_type, description)
              values
              ($1, $2, $3, $4)
            `, [ teamId, info.internal_type, info.external_type, info.description ])
          })
        )
      }
    }
  )
}
