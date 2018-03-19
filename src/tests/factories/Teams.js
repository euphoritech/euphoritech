import { insertQuery, truncateTable } from './Helpers'

export async function createShortHierarchy(postgres) {
  const { rows } = await postgres.query("select * from teams where id = 1")
  if (rows.length > 0)
    return

  await Promise.all([
    postgres.query(insertQuery('teams', { id: 1, name: 'Global', is_global: true })),
    postgres.query(insertQuery('teams', { id: 2, name: 'Child1', parent_team_id: 1 })),
    postgres.query(insertQuery('teams', { id: 3, name: 'Child2', parent_team_id: 1 })),
    postgres.query(insertQuery('teams', { id: 4, name: 'SubChild1', parent_team_id: 2 }))
  ])
}

export async function truncateTeams(postgres) {
  await truncateTable(postgres, 'teams')
}
