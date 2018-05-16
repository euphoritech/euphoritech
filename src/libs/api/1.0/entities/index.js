import SessionHandler from '../../../SessionHandler'
import TeamEntities from '../../../models/TeamEntities'
import TeamEntityLinks from '../../../models/TeamEntityLinks'
import TeamEntityTypes from '../../../models/TeamEntityTypes'

export default {
  async get({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const entities      = TeamEntities(postgres)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const recordId      = req.query.id

    const record = await entities.findBy({ id: recordId, team_id: currentTeamId })
    if (!record)
      return res.status(404).json({ error: res.__("There is no record with the ID provided. Please try again.") })

    res.json({ record })
  },

  async ['types/get']({ req, res, postgres }) {
    const onlyActive    = req.query.onlyActive || true
    const typesInst     = TeamEntityTypes(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()

    let keys = { team_id: currentTeamId }
    if (typeof onlyActive === 'boolean')
      keys.is_active = onlyActive

    const types = await typesInst.getAllBy(keys)
    res.json({ types })
  },

  async ['type/update']({ req, res, postgres, redis }) {
    const typeRecord    = req.body.record
    const typesInst     = TeamEntityTypes(postgres)
    const session       = SessionHandler(req.session, { redis })
    const currentTeamId = session.getCurrentLoggedInTeam()

    const dbRecord = await typesInst.findBy({ team_id: currentTeamId, id: typeRecord.id })
    if (!dbRecord)
      return res.status(401).json({ error: res.__(`We didn't find the record type you are looking for.`) })

    typesInst.setRecord(Object.assign(dbRecord, typeRecord))
    await typesInst.save()
    await session.resetTeamSessionRefresh(currentTeamId)
    res.json(true)
  },

  async ['links/get']({ req, res, postgres }) {
    const entityId = req.query.id

    res.json(true)
  },

  async ['get/by/type']({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityTypeId  = req.query.type_id
    const pageNumber    = req.query.page
    const numPerPage    = req.query.per_page
    // const orderBy       = req.query.order_by

    const records = await entities.findByTypeId(parseInt(entityTypeId), { page: pageNumber, pageSize: numPerPage })
    res.json({ records })
  },

  async create({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityRecord  = req.body.entity

    const existingRecord = await entities.findBy({
      team_id:        currentTeamId,
      source:         entityRecord.source,
      entity_type_id: entityRecord.entityTypeId,
      uid:            entityRecord.uid
    })

    if (existingRecord)
      entities.setRecord(existingRecord)

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
  },

  async update({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityRecord  = req.body.entity

    const record = entities.findBy({ id: entityRecord.id, team_id: currentTeamId })
    if (record) {
      entities.setRecord(Object.assign(record, entityRecord))
      await entities.save()
      return res.json(true)
    }
    res.status(404).json({ error: "There is no entity record that we found to update." })
  }
}
