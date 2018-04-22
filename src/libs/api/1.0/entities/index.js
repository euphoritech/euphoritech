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
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityTypeId  = req.query.type_id
    const pageNumber    = req.query.page
    const numPerPage    = req.query.perPage

    const records = await entities.findByTypeId(parseInt(entityTypeId), { page: pageNumber, pageSize: numPerPage })
    res.json({ records })
  },

  async create({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityRecord  = req.body.entity

    entities.setRecord({
      team_id:        currentTeamId,
      name:           entityRecord.name,
      description:    entityRecord.description,
      source:         entityRecord.source,
      entity_type_id: entityRecord.entityTypeId,
      uid:            entityRecord.uid,
      external_link:  entityRecord.external_link,
      due_date:       entityRecord.dueDate,
      mod1:           entityRecord.mod1,
      mod2:           entityRecord.mod2,
      mod3:           entityRecord.mod3,
      mod4:           entityRecord.mod4,
      mod5:           entityRecord.mod5,
    })
    const newEntityId = await entities.save()

    res.json({ id: newEntityId })
  }
}
