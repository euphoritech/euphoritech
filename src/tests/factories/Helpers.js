import moment from 'moment'

export function insertQuery(table, keyValuePairs) {
  const nowString = `'${moment().format()}'`
  const keys    = Object.keys(keyValuePairs)
  const values  = Object.values(keyValuePairs)

  return `
    insert into ${table} (${keys.join(',')})
    values
    (${values.map(v => (typeof v === 'string') ? `'${v}'` : v).join(',')})
  `
}
