import Teams from '../../../models/Teams'
import Users from '../../../models/Users'

export default {
  async create({ req, res, postgres }) {

  },

  async getCurrentHierarchy({ req, res, postgres }) {
    const teams   = Teams(postgres)
    const users   = Users(postgres, req.session)
    const teamId  = req.query.teamId
    const userId  = users.getLoggedInUserId()

    if (await users.userHasAccessToTeam(userId, teamId)) {
      const rows = teams.getEntireHierarchy(teamId)
      return res.json({ hierarchy: rows })
    }
    res.sendStatus(401)
  }
}
