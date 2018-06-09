import crypto from 'crypto'
import DatabaseModel from './DatabaseModel'

export default function TeamApiKeys(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'team_leaderboard_entities')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'entity_id', 'position'
      ]
    }
  )
}
