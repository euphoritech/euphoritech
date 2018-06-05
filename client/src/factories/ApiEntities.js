import { handleFetchResponse } from './ApiHelpers'

export default {
  async get(id) {
    const response = await euphoritechFetch(`/api/1.0/entities/get?id=${id}`)
    return await handleFetchResponse(response)
  },

  async search({ search, page, perPage, type_id }) {
    const response = await euphoritechFetch(`/api/1.0/entities/search?type_id=${type_id}&page=${page || 1}&perPage=${perPage || 30}&search=${search}`)
    return await handleFetchResponse(response)
  },

  async getTypes(onlyActive=true) {
    if (onlyActive === null || typeof onlyActive === 'undefined')
      onlyActive = ''

    const response = await euphoritechFetch(`/api/1.0/entities/types/get?onlyActive=${onlyActive}`)
    return await handleFetchResponse(response)
  },

  async createType(name, description) {
    const response = await euphoritechFetch(`/api/1.0/entities/type/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
    return await handleFetchResponse(response)
  },

  async updateType(updatedTypeRecord) {
    const response = await euphoritechFetch(`/api/1.0/entities/type/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record: updatedTypeRecord })
    })
    return await handleFetchResponse(response)
  },

  async getLinkedEntities(entityId) {
    const response = await euphoritechFetch(`/api/1.0/entities/links/get?id=${entityId}`)
    return await handleFetchResponse(response)
  },

  async createLink(id1, id2) {
    const response = await euphoritechFetch(`/api/1.0/entities/links/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id1, id2 })
    })
    return await handleFetchResponse(response)
  },

  async getEntityListByType({ type_id, page, perPage }) {
    const response = await euphoritechFetch(`/api/1.0/entities/get/by/type?type_id=${type_id}&page=${page || ''}&perPage=${perPage || ''}`)
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
  },

  async deleteEntity(id) {
    const response = await euphoritechFetch(`/api/1.0/entities/delete?id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    return await handleFetchResponse(response)
  },
}
