import NodeResque from 'node-resque'

export default function startResqueServer({ connection, jobs, log, queues }) {
  return async function() {
    const multiWorker = new NodeResque.MultiWorker({
      connection:          connection,
      queues:              queues,
      minTaskProcessors:   1,
      maxTaskProcessors:   100,
      checkTimeout:        1000,
      maxEventLoopDelay:   10,
      toDisconnectProcessors: true,
    }, jobs)

    const scheduler = new NodeResque.Scheduler({ connection: connection })

    await scheduler.connect()
    scheduler.start()
    multiWorker.start()

    multiWorker.on('start',           (workerId) => log.debug(`worker[${workerId}] started`))
    multiWorker.on('end',             (workerId) => log.debug(`worker[${workerId}] ended`))
    multiWorker.on('cleaning_worker', (workerId, worker, pid) => log.debug(`cleaning old worker ${worker}`))
    multiWorker.on('poll',            (workerId, queue) => log.debug("worker["+workerId+"] polling " + queue))
    multiWorker.on('job',             (workerId, queue, job) => log.info("worker["+workerId+"] working job " + queue + " " + printObject(job)))
    multiWorker.on('reEnqueue',       (workerId, queue, job, plugin) => log.info("worker["+workerId+"] reEnqueue job (" + printObject(plugin) + ") " + queue + " " + printObject(job)))
    multiWorker.on('success',         (workerId, queue, job, result) => log.info("worker["+workerId+"] job success " + queue + " " + printObject(job) + " >> " + printObject(result)))
    multiWorker.on('failure',         (workerId, queue, job, failure) => log.error("worker["+workerId+"] job failure " + queue + " " + printObject(job) + " >> " + printObject(failure)))
    multiWorker.on('error',           (workerId, queue, job, error) => log.error("worker["+workerId+"] error " + queue + " " + printObject(job) + " >> " + printObject(error)))
    multiWorker.on('pause',           (workerId) => log.debug("worker["+workerId+"] paused"))

    // multiWorker emitters
    multiWorker.on('internalError',     (error) => log.error(error))
    multiWorker.on('multiWorkerAction', (verb, delay) => log.debug("*** checked for worker status: " + verb + " (event loop delay: " + delay + "ms)"))

    scheduler.on('start',             function(){ log.debug("scheduler started") })
    scheduler.on('end',               function(){ log.info("scheduler ended") })
    scheduler.on('poll',              function(){ log.debug("scheduler polling") })
    scheduler.on('master',            function(state){ log.info("scheduler became master") })
    scheduler.on('error',             function(error){ log.error("scheduler error >> " + printObject(error)) })
    scheduler.on('working_timestamp', function(timestamp){ log.info("scheduler working timestamp " + timestamp) })
    scheduler.on('transferred_job',   function(timestamp, job){ log.info("scheduler enquing job " + timestamp + " >> " + printObject(job)) })

    process.on('SIGINT', killProcess)
    process.on('SIGTERM', killProcess)

    async function killProcess() {
      multiWorker.workers.forEach(worker => worker.workerCleanup())
      await multiWorker.end()
      await scheduler.end()

      log.info('Shut down worker')
      process.exit()
    }
  }
}

export function printObject(obj) {
  if (!obj)
    return 'N/A'

  if ({}.toString.call(obj) == "[object Object]")
    return JSON.stringify(obj)

  return obj.toString()
}
