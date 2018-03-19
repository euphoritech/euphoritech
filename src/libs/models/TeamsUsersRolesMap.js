import DatabaseModel from './DatabaseModel'
import Teams from './Teams'

export default function TeamsUsersRolesMap(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams_users_roles_map')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'team_id', 'user_id', 'role'
      ],

      async getAllByUserId(userId) {
        const { rows } = await postgres.query(`select * from teams_users_roles_map where user_id = $1`, [ userId ])
        return rows
      },

      async getAllByUsername(username) {
        const { rows } = await postgres.query(`
          select i.* from teams_users_roles_map as i
          inner join users as u on u.id = i.user_id
          where u.username_email = $1
        `, [ username ])
        return rows
      },

      async getByUserIdAndTeamId(userId, teamId) {
        const { rows } = await postgres.query(`
          select * from teams_users_roles_map
          where user_id = $1 and team_id = $2
        `, [ userId, teamId ])
        return rows[0]
      },

      async userHasAccessToTeam(userId, teamId) {
        const teams = Teams(postgres)
        const mapRecords = await this.getAllByUserId(userId)
        if (mapRecords.length > 0) {
          const targetTeamParents = await teams.hierarchyFromBottom(teamId)
          return mapRecords.some(h => {
            return (targetTeamParents.map(p => p.cid).includes(h.team_id) || targetTeamParents.map(p => p.pid).includes(h.team_id))
          })
        }
        return false
      }
    }
  )
}
