import SessionHandler from '../../../SessionHandler'
import TeamEntities from '../../../models/TeamEntities'
import TeamEntityLinks from '../../../models/TeamEntityLinks'
import TeamEntityTypes from '../../../models/TeamEntityTypes'

export default {
  async getTypes({ req, res, postgres }) {
    const typesInst     = TeamEntityTypes(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const types         = await typesInst.getAllBy({ team_id: currentTeamId })

    res.json({ types })
  },

  async getLinks({ req, res, postgres }) {
    const entityId = req.query.id

    res.json(true)
  },

  async getByType({ req, res, postgres }) {
    const entityType = req.query.type
    const pageNumber = req.query.page || 1
    const numPerPage = req.query.perPage || 10

    res.json(true)
  },

  async create({ req, res, postgres }) {
    const entityRecord = req.body.entity

    res.json(true)
  }
}
