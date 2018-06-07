import bunyan from 'bunyan'
import moment from 'moment'
import GeoIp from '../libs/GeoIp'
import Slack from '../libs/Slack'
import RedisHelper from '../libs/RedisHelper'
import PostgresClient from '../libs/PostgresClient'
import LoginHandler from '../libs/LoginHandler'
import SessionHandler from '../libs/SessionHandler'
import Users from '../libs/models/Users'
import config from '../config'

const redisClient = new RedisHelper()
const postgres    = new PostgresClient()
const log = bunyan.createLogger(config.logger.options)

export default async function Index(req, res) {
  try {
    const loginHandler    = LoginHandler(postgres, req.session)
    const sessionHandler  = SessionHandler(req.session, { redis: redisClient })
    const users           = Users(postgres, req.session)
    const currentTeamId   = sessionHandler.getCurrentLoggedInTeam()
    const currentUserId   = sessionHandler.getLoggedInUserId()

    if (req.params[0].indexOf("favicon.ico") !== 0 && currentTeamId) {
      req.session.returnTo = req.params[0]
      req.session.save()
    }

    res.render('index', {})

    if (currentTeamId) {
      if (await sessionHandler.checkIfShouldRefreshSession(currentTeamId)) {
        const currentUser = await users.find(currentUserId)
        log.info(`Resetting session cache for user '${currentUser.username_email}' in team ID: ${currentTeamId}`)
        users.setRecord(Object.assign({}, currentUser, { last_session_refresh: new Date() }))
        await users.save()
        await loginHandler.standardLogin(users.record)
        // await sessionHandler.resetTeamSessionRefresh(currentTeamId)
      }
    }

    // Only try to send to Slack if the webhook URL for the channel is configured
    if (config.slack.webhookUrl) {
      let realClientIpAddress = (req.headers['x-forwarded-for'] || req.ip).split(',')
      realClientIpAddress = realClientIpAddress[realClientIpAddress.length - 1]
      const redisCacheKey = `ip_recent_${realClientIpAddress}`
      const currentCache = await redisClient.get(redisCacheKey)
      if (currentCache) {
        await redisClient.set(redisCacheKey, 'true', { ttl: 60 * 10 })
      } else {
        const location = await GeoIp.location(realClientIpAddress)
        await Slack.send(`Someone visited the main page -- IP: ${realClientIpAddress} (location: ${location.city}, ${location.region_code}, ${location.country_name}), hostname: ${req.hostname}, User-Agent: ${req.headers['user-agent']}`)
        await redisClient.set(redisCacheKey, 'true', { ttl: 60 * 10 })
      }
    }

  } catch(err) {
    log.error("Error sending slack message", err)
  }
}
