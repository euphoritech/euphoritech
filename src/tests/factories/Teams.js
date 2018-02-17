import { insertQuery } from './Helpers'

export async function createShortHierarchy(postgres) {
  await Promise.all([
    postgres.query(insertQuery('teams', { id: 1, name: 'Global' })),
    postgres.query(insertQuery('teams', { id: 2, name: 'Child1', parent_team_id: 1 })),
    postgres.query(insertQuery('teams', { id: 3, name: 'Child2', parent_team_id: 1 })),
    postgres.query(insertQuery('teams', { id: 4, name: 'SubChild1', parent_team_id: 2 }))
  ])
}

export async function truncateTeams(postgres) {
  await postgres.query('truncate teams cascade')
}
