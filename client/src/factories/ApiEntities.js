import { handleFetchResponse } from './ApiHelpers'

export default {
  async getTypes() {
    const response = await euphoritechFetch(`/api/1.0/entities/getTypes`)
    return await handleFetchResponse(response)
  },

  async getLinkedEntities(entityId) {
    const response = await euphoritechFetch(`/api/1.0/entities/getLinks?id=${entityId}`)
    return await handleFetchResponse(response)
  },

  async getEntityListByType({ type, page, perPage }) {
    const response = await euphoritechFetch(`/api/1.0/entities/getByType?type=${type}&page=${page}&perPage=${perPage}`)
    return await handleFetchResponse(response)
  },

  async createEntity(entity) {
    const response = await euphoritechFetch(`/api/1.0/entities/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    })
    return await handleFetchResponse(response)
  }
}
