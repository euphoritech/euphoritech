import bunyan from 'bunyan'
import ApiVersions from '../libs/api/'
import PostgresClient from '../libs/PostgresClient'
import Routes from '../libs/Routes'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const postgres = new PostgresClient()

export default [
    Routes.requireAuthExpressMiddleware(),
    async function ApiNamespaceCommand(req, res) {
    const version   = req.params.version
    const namespace = req.params.namespace
    const command   = req.params.command

    try {
      await ApiVersions[version][namespace][command]({ req, res, log, postgres })
    } catch(err) {
      log.error("Error with API request", err)
      res.sendStatus(404)
    }
  }
]
