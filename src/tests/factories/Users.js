import { insertQuery, truncateTable } from './Helpers'

export async function createUser(postgres) {
  await postgres.query(insertQuery('users', { id: 1, name: 'Lance', username_email: 'lance@euphoritech.com' }))
}

export async function truncateUsers(postgres) {
  await truncateTable(postgres, 'users')
}
