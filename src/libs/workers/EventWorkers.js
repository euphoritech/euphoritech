import TeamEvents from '../models/TeamEvents'
import config from '../../config'

export default function EventWorkers(options={}) {
  const postgres  = options.postgres
  const logger    = options.log
  const events    = TeamEvents(postgres, { logger })

  return {
    fireEvent: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async (teamId, type) => {
        const results = await events.fireSync(teamId, type)
        return (results) ? results.length : results
      }
    }
  }
}
