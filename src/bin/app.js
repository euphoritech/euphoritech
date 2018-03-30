/* Entry point for express web server
 * to listen for HTTP requests
 */

import newrelic from 'newrelic'
import os from 'os'
import cluster from 'cluster'
import bunyan from 'bunyan'
import sticky from 'sticky-cluster'
import webServer from '../libs/webServer'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const [ httpServer, startWebServer ] = webServer()

sticky(async function(callback) {
  try {
    await startWebServer()
    callback(httpServer)
  } catch(err) {
    log.error(`Web server error`, err)
    process.exit()
  }
}, {
  concurrency:  config.server.concurrency,
  port:         config.server.port,
  debug:        !config.server.isProduction
})


// --------------------------------------------------
// TODO: Delete this code, which was for using npm module `sticky-session`
// once we determine `sticky-cluster` works as we want
//
// ;(async function() {
//   try {
//     if (!sticky.listen(httpServer, config.server.port)) {     // Master code
//       httpServer.once("listening", () => log.info(`listening on *: ${config.server.port}`))
//
//       // Create a worker based on concurrency config
//       const concurrencyCount = parseInt(config.server.concurrency)
//       new Array(concurrencyCount).fill(0).forEach(() => cluster.fork())
//
//       // Listen for dying workers
//       cluster.on("exit", worker => cluster.fork())
//
//     } else {      // Worker code
//       await startWebServer()
//     }
//   } catch(err) {
//     log.error(`Web server error`, err)
//   }
// })()
// --------------------------------------------------
