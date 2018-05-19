import NodeResque from 'node-resque'
import requireFromString from 'require-from-string'
import Aws from '../Aws'
import DatabaseModel from './DatabaseModel'
import Extensions from './Extensions'
import config from '../../config'

const s3 = Aws().S3

export default function TeamEvents(postgres, { logger, redis }) {
  const factoryToExtend = DatabaseModel(postgres, 'team_events')
  const extensions      = Extensions(postgres)

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'user_id', 'type', 'extension_id', 'params'
      ],

      types: {
        CREATE_ENTITY:      'Create Record',
        DELETE_ENTITY:      'Delete Record',
        UPDATE_ENTITY_TYPE: 'Update Record Type',
        UPDATE_ENTITY:      'Update Record'
      },

      async fire(team_id, type) {
        const queue = new NodeResque.Queue({ connection: { redis: redis.client }})
        await queue.connect()
        await queue.enqueue(config.resque.default_queue, 'fireEvent', [team_id, type])
      },

      async fireSync(team_id, type) {
        try {
          const eventsToFire = await this.getAllBy({ team_id, type })
          if (eventsToFire && eventsToFire.length > 0) {
            const results = await Promise.all(
              eventsToFire.map(async evt => await extensions.execute(evt.extension_id, evt.params))
            )
            return results
          }
          return false

        } catch(err) {
          if (logger)
            logger.error(err)
        }
      }
    }
  )
}
