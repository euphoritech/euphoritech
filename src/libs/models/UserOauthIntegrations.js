import DatabaseModel from './DatabaseModel'

export default function UserOauthIntegrations(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'user_oauth_integrations')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id', 'type', 'unique_id', 'access_token', 'refresh_token',
        'first_name', 'last_name', 'email', 'expires'
      ],

      async getAllByUserId(userId) {
        const { rows } = await postgres.query(`select * from user_oauth_integrations where user_id = $1`, [ userId ])
        return rows
      },

      async getAllByUsername(username) {
        const { rows } = await postgres.query(`
          select i.* from user_oauth_integrations as i
          inner join users as u on u.id = i.user_id
          where u.username_email = $1
        `, [ username ])
        return rows
      },

      // 20180217: As of today there can only be
      // one integration of a specific type per user
      async getByUserIdAndType(userId, type) {
        const { rows } = await postgres.query(`
          select * from user_oauth_integrations
          where user_id = $1 and type = $2
        `, [ userId, type ])
        return rows[0]
      }
    }
  )
}
