import assert from 'assert'
import RedisHelper from './RedisHelper'

const redis = new RedisHelper('redis://localhost:6379')

describe('RedisHelper', () => {
  it(`#set & #del() should set and subsequently delete key without error`, async function() {
    const key = 'test_1'
    const val = 'val'

    await redis.client.set(key, val)
    const afterSetResult = await redis.client.get(key)
    await redis.client.del(key)
    const afterDeleteResult = await redis.client.get(key)

    assert.equal(val, afterSetResult)
    assert.equal(null, afterDeleteResult)
  })
})
