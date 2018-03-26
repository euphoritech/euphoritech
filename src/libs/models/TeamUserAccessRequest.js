import requireFromString from 'require-from-string'
import config from '../../config'
import DatabaseModel from './DatabaseModel'

export default function TeamUserAccessRequest(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_user_access_request')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'requesting_user_id', 'team_id', 'requested_time', 'status'
      ]
    }
  )
}
