import Redis from 'ioredis'
import config from '../config'

const NOOP = () => {}

export default class RedisHelper {
  constructor(urlOrClient) {
    try {
      if (typeof urlOrClient === 'string') {
        this.client = new Redis(urlOrClient)
      } else {
        this.client = urlOrClient || new Redis(config.redis.url)
      }
    } catch(e) {
      this.client = null
    }
  }

  //http://redis.io/commands/INFO
  //memory information about redis instance
  info(param) {
    return new Promise((resolve, reject) => {
      this.client.info(param, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  }

  numberOfKeys() {
    return new Promise((resolve, reject) => {
      this.client.dbsize((err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    })
  }

  scan(cursor, options=null) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }

      if (options instanceof Array) {
        return this.client.scan(cursor, ...options, callback)
      }
      this.client.scan(cursor, callback)
    })
  }

  async scanMatch(match, iterationCallback=NOOP, cursor=0, numMatches=0) {
    const [ newCursor, matches ] = await this.scan(cursor, [ 'match', match ])
    if (matches && matches.length > 0) {
      numMatches += matches.length
      await Promise.all(matches.map(async match => await iterationCallback(match)))
    }

    if (newCursor == '0')
      return numMatches

    return await this.scanMatch(match, newCursor, iterationCallback, numMatches)
  }

  end() {
    this.client.quit()
  }

  close() {
    this.end()
  }

  quit() {
    this.end()
  }
}
