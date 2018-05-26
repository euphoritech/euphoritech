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

  async ['type/update']({ req, res, postgres, redis, events }) {
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

    await events.fire(currentTeamId, events.types.UPDATE_ENTITY_TYPE)
  },

  async ['links/get']({ req, res, postgres }) {
    const entityId = req.query.id

    res.json(true)
  },

  async ['get/by/type']({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const status        = req.query.status || 'active'
    const entityTypeId  = req.query.type_id
    const pageNumber    = req.query.page || 1
    const numPerPage    = req.query.per_page || 30
    // const orderBy       = req.query.order_by

    let records
    if (entityTypeId === 'deleted') {
      records = await entities.getAllBy({ team_id: currentTeamId, status: 'deleted' }, { page: pageNumber, pageSize: numPerPage })
    } else if (!isNaN(parseInt(entityTypeId))) {
      records = await entities.findByTypeId(currentTeamId, parseInt(entityTypeId), status, { page: pageNumber, pageSize: numPerPage })
    } else {
      return res.status(400).json({ error: res.__(`Please provide a valid type ID to search for records.`) })
    }
    res.json({ records })
  },

  async create({ req, res, postgres, events }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityRecord  = req.body.entity
    const newEntityId   = await entities.createOrUpdate(currentTeamId, entityRecord)
    res.json({ id: newEntityId })

    await events.fire(currentTeamId, events.types.CREATE_ENTITY)
  },

  async update({ req, res, postgres, events }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityRecord  = req.body.entity

    const record = await entities.findBy({ team_id: currentTeamId, id: entityRecord.id })
    if (record) {
      entities.setRecord(Object.assign(record, entityRecord))
      await entities.save()
      res.json(true)

      return await events.fire(currentTeamId, events.types.UPDATE_ENTITY)
    }
    res.status(404).json({ error: res.__("There is no entity record that we found to update.") })
  },

  async delete({ req, res, postgres, events }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityId      = req.query.id

    const record = await entities.findBy({ team_id: currentTeamId, id: parseInt(entityId) })
    if (record) {
      entities.setRecord(Object.assign(record, { status: 'deleted' }))
      await entities.save()
      res.json(true)

      return await events.fire(currentTeamId, events.types.DELETE_ENTITY)
    }
    res.status(404).json({ error: res.__("There is no entity record that we found to delete.") })
  }
}
