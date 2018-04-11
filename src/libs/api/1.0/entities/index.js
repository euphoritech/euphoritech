import TeamEntities from '../../../models/TeamEntities'
import TeamEntityLinks from '../../../models/TeamEntityLinks'

export default {
  async getLinkedEntities({ req, res, postgres }) {
    const entityId = req.query.id

    res.json(true)
  },

  async getEntityListByType({ req, res, postgres }) {
    const entityType = req.query.type
    const pageNumber = req.query.page || 1
    const numPerPage = req.query.perPage || 10

    res.json(true)
  },

  async createEntity({ req, res, postgres }) {
    const entityRecord = req.body.entity
    
    res.json(true)
  }
}
