import crypto from 'crypto'
import DatabaseModel from './DatabaseModel'

export default function TeamApiKeys(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_api_keys')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'api_key', 'status'
      ],

      createKey(userId, teamId) {
        const shaSum = crypto.createHash('sha1')
        shaSum.update(`${userId}|${teamId}|${Date.now()}`)
        return shaSum.digest('hex')
      }
    }
  )
}
