import { handleFetchResponse } from './ApiHelpers'

export default {
  async hasIntegration(type) {
    const response = await euphoritechFetch(`/api/1.0/env/hasIntegration?type=${type}`)
    return await handleFetchResponse(response)
  }
}
