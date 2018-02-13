import 'babel-polyfill'
import runMigrations from '../libs/database/migrations'

;(async function() {
  await runMigrations()
  process.exit()
})()
