import { insertQuery, truncateTable } from './Helpers'

export async function createTeamsUsersRolesMap(postgres, obj={}) {
  await postgres.query(insertQuery('teams_users_roles_map', { id: obj.id || 1, team_id: obj.team_id || 1, user_id: obj.user_id || 1, role: obj.role || 'superadmin' }))
}

export async function truncateTeamsUsersRolesMap(postgres) {
  await truncateTable(postgres, 'teams_users_roles_map')
}
