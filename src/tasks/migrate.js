import minimist from 'minimist'
import bunyan from 'bunyan'
import runMigrations from '../libs/database/migrations'
import config from '../config'

const argv = minimist(process.argv.slice(2))
const postgresUrl = argv.c || argv.connection_string || config.postgres.connection_string

;(async function(connString) {
  await runMigrations(connString)
  process.exit()
})(postgresUrl)
