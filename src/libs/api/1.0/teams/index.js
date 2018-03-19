import Teams from '../../../models/Teams'
import TeamsUsersRolesMap from '../../../models/TeamsUsersRolesMap'
import Users from '../../../models/Users'

export default {
  async create({ req, res, postgres }) {

  },

  async getCurrentHierarchy({ req, res, postgres }) {
    const teams   = Teams(postgres)
    const turm    = TeamsUsersRolesMap(postgres)
    const users   = Users(postgres, req.session)
    const teamId  = req.query.teamId || (req.session.user ? req.session.user.current_team_id : null)
    const userId  = users.getLoggedInUserId()

    if (!teamId)
      return res.status(400).json({ error: "Please provide a valid team ID to get it's hierarchy." })

    if (await turm.userHasAccessToTeam(userId, teamId)) {
      const rows = await teams.getEntireHierarchy(teamId)
      return res.json({ hierarchy: rows })
    }
    res.sendStatus(401)
  }
}
