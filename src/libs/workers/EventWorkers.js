import TeamEvents from '../models/TeamEvents'
import config from '../../config'

export default function EventWorkers(options={}) {
  const postgres  = options.postgres
  const events    = TeamEvents(postgres)

  return {
    fireEvent: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async (teamId, type, params) => {
        const results = await events.fireSync(teamId, type, params)
        return (results) ? results.length : results
      }
    }
  }
}
