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
