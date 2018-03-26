import 'babel-polyfill'
import minimist from 'minimist'
import NodeResque from 'node-resque'
import RedisHelper from '../../libs/RedisHelper'

const argv = minimist(process.argv.slice(2))
const countOnly   = argv.c || argv.count
const onlyRemove  = argv.d || argv.delete || argv.r || argv.remove
const onlyShow    = argv.s || argv.show

;(async () => {
  const redis = new RedisHelper()
  const queue = new NodeResque.Queue({ connection: { redis: redis.client }})
  await queue.connect()

  const failedCount = await queue.failedCount()

  if (countOnly) {
    console.log(`Currently ${failedCount} failed jobs.`)
  } else {
    const failedJobs = await queue.failed(0, Date.now())

    if (onlyShow) {
      failedJobs.forEach((job, ind) => console.log(`Job ${ind + 1}`, job))
      await queue.end()
      return process.exit()
    }

    let method  = 'retryAndRemoveFailed'
    let verb    = 'Retried'
    if (onlyRemove) {
      method  = 'removeFailed'
      verb    = 'Deleted'
    }

    await Promise.all(failedJobs.map(async job => await queue[method](job)))
    console.log(`${verb} ${failedCount} failed jobs.`)
  }

  await queue.end()
  process.exit()
})()
