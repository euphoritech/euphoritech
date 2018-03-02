import assert from 'assert'
import PostgresClient from './PostgresClient'

const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'
const postgres = new PostgresClient(postgresUrl)

describe('PostgresClient', function() {
  describe('#query', function() {
    it(`should query the database and return rows`, async function() {
      const { rows } = await postgres.query('select 1 as col')
      assert.equal(true, rows instanceof Array)
      assert.equal(1, rows.length)
      assert.equal('col', Object.keys(rows[0])[0])
      assert.equal(1, rows[0]['col'])
    })
  })

  describe('#queryStream', function() {
    it(`should query the database through a stream and individual rows should be processed in a callback`, async function() {
      let rows = []
      await postgres.queryStream('select 1 as col', row => rows.push(row))
      await postgres.queryStream('select 2 as col2', row => rows.push(row))

      assert.equal(true, rows instanceof Array)
      assert.equal(2, rows.length)
      assert.equal('col', Object.keys(rows[0])[0])
      assert.equal(1, rows[0]['col'])
      assert.equal(2, rows[1]['col2'])
    })
  })
})
