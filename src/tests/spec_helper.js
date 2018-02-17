import 'babel-polyfill'
import path from 'path'
import child_process from 'child_process'

const fork        = child_process.fork
const postgresUrl = process.env.TEST_DB || process.env.DATABASE_URL || 'postgresql://localhost:5432/euphoritech_test'

;(async () => await runMigrations(postgresUrl))()

async function runMigrations(postgresUrl) {
  return await new Promise((resolve, reject) => {
    const postgresMigrationProcess = fork(path.join('.', 'tasks', 'migrate'), [ '-c', postgresUrl ])
    postgresMigrationProcess.on('exit', resolve)
    postgresMigrationProcess.on('error', reject)
  })
}
