import moment from 'moment'
import PostgresClient from '../../libs/PostgresClient.js'

const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech'
const postgres    = new PostgresClient(postgresUrl, { max: 1 })

export async function createShortHierarchy() {
  await Promise.all([
    postgres.query(insertQuery({ id: 1, name: 'Global' })),
    postgres.query(insertQuery({ id: 2, name: 'Child1', parent_team_id: 1 })),
    postgres.query(insertQuery({ id: 3, name: 'Child2', parent_team_id: 1 })),
    postgres.query(insertQuery({ id: 4, name: 'SubChild1', parent_team_id: 2 }))
  ])
}

export async function truncateTeams() {
  await postgres.query('truncate teams cascade')
}

function insertQuery(keyValuePairs={}) {
  const nowString = `'${moment().format()}'`
  const keys    = Object.keys(keyValuePairs)
  const values  = Object.values(keyValuePairs)

  return `
    insert into Teams (${keys.join(',')})
    values
    (${values.map(v => (typeof v === 'string') ? `'${v}'` : v).join(',')})
  `
}
