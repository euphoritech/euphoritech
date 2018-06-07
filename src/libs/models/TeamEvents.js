import NodeResque from 'node-resque'
import Aws from '../Aws'
import DatabaseModel from './DatabaseModel'
import Extensions from './Extensions'
import config from '../../config'

const s3 = Aws().S3

export default function TeamEvents(postgres, { redis }={}) {
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
        CREATE_ENTITY_TYPE: 'Create Record Type',
        UPDATE_ENTITY_TYPE: 'Update Record Type',
        UPDATE_ENTITY:      'Update Record'
      },

      async fire(team_id, type, params=null) {
        const queue = new NodeResque.Queue({ connection: { redis: redis.client }})
        await queue.connect()
        await queue.enqueue(config.resque.default_queue, 'fireEvent', [team_id, type, params])
      },

      async fireSync(team_id, type, params=null) {
        const eventsToFire = await this.getAllBy({ team_id, type })
        if (eventsToFire && eventsToFire.length > 0) {
          return await Promise.all(
            eventsToFire.map(async evt => {
              // TODO: evt.params contains what parameters that may need
              // to be specified by the user when configuring a new event.
              // params passed as an argument in fireSync is any information
              // passed about the event itself. Determine how to link them here
              // before passing them to extension#execute
              return await extensions.execute(evt.extension_id, Object.assign({ event_type: type }, evt.params || {}, params || {}))
            })
          )
        }
        return false
      }
    }
  )
}
