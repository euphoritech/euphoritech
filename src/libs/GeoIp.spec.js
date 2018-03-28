import path from 'path'
import assert from 'assert'
import GeoIp from './GeoIp.js'

describe('GeoIp', function() {
  describe('#location()', function() {
    it(`should get JSON response of google's IP 8.8.8.8`, async () => {
      const ip  = '8.8.8.8'
      const res = await GeoIp.location(ip)

      assert.equal(res.ip, ip)
    })
  })
})
