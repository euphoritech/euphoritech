import assert from 'assert'
import moment from 'moment'
import RedisHelper from './RedisHelper'
import SessionHandler from './SessionHandler'

const redis = new RedisHelper('redis://localhost:6379')
const session = SessionHandler(null, { redis })

describe('SessionHandler', () => {
  it(`#resetTeamSessionRefresh`, async function() {
    await session.resetTeamSessionRefresh(1)
    const val = await redis.get('team_session_refresh_1')
    const ttl = await redis.ttl('team_session_refresh_1')
    assert.equal(true, moment(val).isSameOrBefore(moment()))
    assert.equal(true, ttl <= 86400)
  })
})
