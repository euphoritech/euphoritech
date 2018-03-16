import bunyan from 'bunyan'
import ApiVersions from '../libs/api/'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)

export default async function ApiNamespaceCommand(req, res) {
  const version   = req.params.version
  const namespace = req.params.namespace
  const command   = req.params.command

  try {
    await ApiVersions[version][namespace][command]({ req, res })
  } catch(err) {
    log.error("Error with API request", err)
    res.sendStatus(404)
  }
}
