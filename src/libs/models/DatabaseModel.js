import PostgresSqlParser from '../PostgresSqlParser'
import config from '../../config'

export default function DatabaseModel(postgres, table) {
  return {
    accessibleColumns: [],
    record: {},

    setRecord(obj) {
      return this.record = Object.assign(this.record, obj)
    },

    resetRecord() {
      return this.record = {}
    },

    async getAll() {
      const { rows } = await postgres.query(`select * from ${table}`)
      return rows
    },

    // Uses AND logic between columns
    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async getAllBy(keyValuePairs, pagination=null) {
      const columnAry     = Object.keys(keyValuePairs)
      const paramsAry     = []
      const filters       = columnAry.map((col, ind) => {
        paramsAry.push(keyValuePairs[col])
        return `${col} = $${ind + 1}`
      })
      const filterString  = filters.join(' AND ')
      let query           = `select * from ${table} where ${filterString}`

      if (typeof pagination === 'object' && pagination != null) {
        const parser = PostgresSqlParser(query).setPagination(pagination.page, pagination.pageSize || 100).deparse()
        query = parser.query
      }

      const { rows } = await postgres.query(query, paramsAry)
      return rows
    },

    async findByColumn(value, column='id') {
      const { rows } = await postgres.query(`select * from ${table} where ${column} = $1`, [ value ])
      if (rows.length > 0)
        return rows[0]
      return null
    },

    async find(id) {
      return await this.findBy({ id })
    },

    // Uses AND logic between columns
    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async findBy(keyValuePairs) {
      const rows = await this.getAllBy(keyValuePairs)
      if (rows.length > 0)
        return rows[0]
      return null
    },

    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async findOrCreateBy(keyValuePairs) {
      const check = await this.findBy(keyValuePairs)
      if (check)
        return this.record = check

      this.record   = Object.assign(this.record, keyValuePairs)
      const curId   = await this.save()
      const newId   = (this.record.id) ? this.record.id : curId
      this.record   = Object.assign(this.record, { id: newId })
      return this.record
    },

    // Ex. keyValuePairs = { col1: 'val1', col2: 'col2', ... }
    async updateOrCreateBy(keyValuePairs) {
      const currentRecord = Object.assign({}, this.record)
      const returnedRecord = await this.findBy(keyValuePairs)
      this.record = Object.assign(returnedRecord || {}, currentRecord, keyValuePairs)

      await this.save()
      return this.record
    },

    async save(uniqueColumnIfNoId=null) {
      const keysInRecord = Object.keys(this.record)
      if (keysInRecord.length > 0) {
        let queryAry,
            paramsAry = [],
            paramIndTracker = 1

        if (this.record.id) {
          queryAry = [ `update ${table} set` ]

          keysInRecord.forEach(key => {
            if (this.accessibleColumns.indexOf(key) === -1) return

            queryAry.push(`${key} = $${paramIndTracker},`)
            paramsAry.push(this.record[key])
            paramIndTracker++
          })
          if (paramsAry.length === 0) return false

          queryAry.push(`updated_at = now() at time zone 'utc'`)
          queryAry.push(`where id = $${paramIndTracker}`)
          paramsAry.push(this.record.id)

          const queryString = queryAry.join(' ')
          await postgres.query(queryString, paramsAry)
          return this.record.id

        } else if (this.record[ uniqueColumnIfNoId ]) {
          const currentRecord = Object.assign({}, this.record)
          await this.findOrCreateByColumn(this.record[uniqueColumnIfNoId], uniqueColumnIfNoId)
          this.record = Object.assign(this.record, currentRecord)
          return await this.save()

        } else { // insert new record
          queryAry = [ `insert into ${table} (` ]
          let paramList = []

          keysInRecord.forEach(key => {
            if (this.accessibleColumns.indexOf(key) === -1) return

            queryAry.push(`${key},`)
            paramList.push(`$${paramIndTracker}`)
            paramsAry.push(this.record[key])
            paramIndTracker++
          })

          queryAry.push(`created_at, updated_at) values (${paramList.join(',')}, now() at time zone 'utc', now() at time zone 'utc') returning id`)
          const qs = queryAry.join(' ')
          const { rows } = await postgres.query(qs, paramsAry)
          return (rows.length > 0) ? rows[0].id : false
         }
      }
      return false
    },

    async delete(id) {
      return await postgres.query(`delete from ${table} where id = $1`, [ id ])
    }
  }
}
