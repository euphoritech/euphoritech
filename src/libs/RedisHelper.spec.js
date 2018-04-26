import assert from 'assert'
import RedisHelper from './RedisHelper'

const redis = new RedisHelper('redis://localhost:6379')

describe('RedisHelper', () => {
  it(`#set, #get, & #del() should set, get, and subsequently delete key without error`, async function() {
    const key = 'test_1'
    const val = 'val'

    await redis.set(key, val)
    const afterSetResult = await redis.get(key)
    await redis.del(key)
    const afterDeleteResult = await redis.get(key)

    assert.equal(val, afterSetResult)
    assert.equal(null, afterDeleteResult)
  })
})
