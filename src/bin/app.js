/* Entry point for express web server
 * to listen for HTTP requests
 */

import newrelic from 'newrelic'
import os from 'os'
import cluster from 'cluster'
import bunyan from 'bunyan'
import sticky from 'sticky-session'
import webServer from '../libs/webServer'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const [ httpServer, startWebServer ] = webServer()

;(async function() {
  try {
    if (!sticky.listen(httpServer, config.server.port)) {     // Master code
      httpServer.once("listening", () => log.info(`listening on *: ${config.server.port}`))

      // Create a worker based on concurrency config
      const concurrencyCount = parseInt(config.server.concurrency)
      new Array(concurrencyCount).fill(0).forEach(() => cluster.fork())

      // Listen for dying workers
      cluster.on("exit", worker => cluster.fork())

    } else {      // Worker code
      await startWebServer()
    }
  } catch(err) {
    log.error(`Web server error`, err)
  }
})()
