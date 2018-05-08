import { handleFetchResponse } from './ApiHelpers'

export default {
  async getTypes(onlyActive=true) {
    if (onlyActive === null || typeof onlyActive === 'undefined')
      onlyActive = ''

    const response = await euphoritechFetch(`/api/1.0/entities/getTypes?onlyActive=${onlyActive}`)
    return await handleFetchResponse(response)
  },

  async updateType(updatedTypeRecord) {
    const response = await euphoritechFetch(`/api/1.0/entities/updateType`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: updatedTypeRecord })
    })
    return await handleFetchResponse(response)
  },

  async getLinkedEntities(entityId) {
    const response = await euphoritechFetch(`/api/1.0/entities/getLinks?id=${entityId}`)
    return await handleFetchResponse(response)
  },

  async getEntityListByType({ type_id, page, perPage }) {
    const response = await euphoritechFetch(`/api/1.0/entities/getByType?type_id=${type_id}&page=${page || ''}&perPage=${perPage || ''}`)
    return await handleFetchResponse(response)
  },

  async createEntity(entity) {
    const response = await euphoritechFetch(`/api/1.0/entities/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity })
    })
    return await handleFetchResponse(response)
  },

  async updateEntity(entity) {
    const response = await euphoritechFetch(`/api/1.0/entities/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity })
    })
    return await handleFetchResponse(response)
  }
}
