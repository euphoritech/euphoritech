import 'babel-polyfill'
import newrelic from 'newrelic'
import minimist from 'minimist'
import NodeResque from 'node-resque'
import throng from 'throng'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import RedisHelper from '../libs/RedisHelper'
import TeamWorkers from '../libs/workers/TeamWorkers'
import startResqueServer from '../libs/startResqueServer'
import config from '../config'

const argv = minimist(process.argv.slice(2))
const log = bunyan.createLogger(config.logger.options)

const queues = argv.q || argv.queue || argv.queues || config.resque.default_queue
const queuesAry = queues.split(',')

const redisClient       = new RedisHelper()
const postgres          = new PostgresClient()
const connectionDetails = { redis: redisClient.client }

const jobs = TeamWorkers({ postgres })

// entry point to workers
throng({
  workers:  config.server.concurrency,
  lifetime: Infinity,
  grace:    3000,
  start:    startResqueServer({ connection: connectionDetails, jobs: jobs, log: log, queues: queuesAry })
})
