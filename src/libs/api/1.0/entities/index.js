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

  async search({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const entities      = TeamEntities(postgres)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const query         = req.query.search
    const page          = req.query.page
    const pageSize      = req.query.perPage
    const type_id       = req.query.type_id

    const info = await entities.recordSearch(currentTeamId, query, { page, pageSize, type_id })
    res.json({ info })
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

  async ['type/create']({ req, res, postgres, redis, events }) {
    const typeRecord    = req.body.record
    const typesInst     = TeamEntityTypes(postgres)
    const session       = SessionHandler(req.session, { redis })
    const currentTeamId = session.getCurrentLoggedInTeam()
    const typeName      = req.body.name
    const typeDesc      = req.body.description

    const dbRecord = await typesInst.findBy({ team_id: currentTeamId, name: typeName })
    console.log("REC", dbRecord)
    if (dbRecord) {
      typesInst.setRecord(Object.assign(dbRecord, { description: typeDesc }))
    } else {
      typesInst.setRecord({ team_id: currentTeamId, name: typeName, description: typeDesc })
    }

    const newId = await typesInst.save()
    await session.resetTeamSessionRefresh(currentTeamId)
    res.json({ new_id: newId })

    await events.fire(currentTeamId, events.types.CREATE_ENTITY_TYPE)
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
    const session       = SessionHandler(req.session)
    const links         = TeamEntityLinks(postgres)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entityId      = req.query.id

    const linkRecords = await links.findByEntity(currentTeamId, entityId)
    res.json({ records: linkRecords })
  },

  async ['links/create']({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const links         = TeamEntityLinks(postgres)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const entity1Id     = req.body.id1
    const entity2Id     = req.body.id2

    if (entity1Id == entity2Id)
      return res.status(400).json({ error: res.__("You cannot create a link between the same record.") })

    const linkId = await links.getLinkId(currentTeamId, entity1Id, entity2Id)
    if (linkId) {
      links.setRecord({ id: linkId, status: 'active' })
      await links.save()
      return res.json(true)
    }

    links.setRecord({ team_id: currentTeamId, entity1_id: entity1Id, entity2_id: entity2Id })
    const newId = await links.save()

    res.json({ link_id: newId })
  },

  async ['get/by/type']({ req, res, postgres }) {
    const entities      = TeamEntities(postgres)
    const session       = SessionHandler(req.session)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const status        = req.query.status || 'active'
    const entityTypeId  = req.query.type_id
    const pageNumber    = req.query.page || 1
    const numPerPage    = req.query.perPage || 30
    // const orderBy       = req.query.order_by

    let info
    if (entityTypeId === 'deleted') {
      info = await entities.getAllBy({ team_id: currentTeamId, status: 'deleted' }, { page: pageNumber, pageSize: numPerPage })
    } else if (!isNaN(parseInt(entityTypeId))) {
      info = await entities.findByTypeId(currentTeamId, parseInt(entityTypeId), status, { page: pageNumber, pageSize: numPerPage })
    } else {
      return res.status(400).json({ error: res.__(`Please provide a valid type ID to get records.`) })
    }
    res.json({ info })
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
