import minimist from 'minimist'
import NodeResque from 'node-resque'
import RedisHelper from '../../libs/RedisHelper'

const argv = minimist(process.argv.slice(2))
const ageOfJob  = parseInt(argv.a || argv.age || 0)

;(async () => {
  const redis = new RedisHelper()
  const queue = new NodeResque.Queue({ connection: { redis: redis.client }})
  await queue.connect()
  await queue.cleanOldWorkers(ageOfJob)
  await queue.end()
  process.exit()
})()
