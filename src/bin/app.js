/* Entry point for express web server
 * to listen for HTTP requests
 */

import 'babel-polyfill'
import newrelic from 'newrelic'
import throng from 'throng'
import startWebServer from '../libs/startWebServer'
import config from '../config'

// entry point to start server
// throng allows for multiple processes based on
// concurrency configurations (i.e. num CPUs available.)
throng({
  workers:  config.server.concurrency,
  lifetime: Infinity,
  grace:    8000,
  start:    startWebServer
})
