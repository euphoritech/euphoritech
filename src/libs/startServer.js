import http from 'http'
import https from 'https'
import os from 'os'
import url from 'url'
import path from 'path'
import fs from 'fs'
import session from 'express-session'
import formidable from 'express-formidable'
import ConnectRedis from 'connect-redis'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import express from 'express'
import throng from 'throng'
import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import Routes from '../libs/Routes'
import config from '../config'

const app         = express()
const httpServer  = http.Server(app)
const pgClient    = new PostgresClient()
const log         = bunyan.createLogger(config.logger.options)

export default async function startApp() {
  try {
    const routes = await Routes.get()

    //view engine setup
    app.set('views', path.join(__dirname, '..', 'views'))
    app.set('view engine', 'pug')

    app.use(bodyParser.urlencoded({extended: true, limit: '1mb'}))
    app.use(bodyParser.json({limit: '1mb'}))
    app.use(formidable.parse())
    app.use(cookieParser(config.session.sessionSecret))

    const RedisStore = ConnectRedis(session)
    app.use(
      session({
        store:              new RedisStore({client: config.redis.client, ttl: 60 * 60 * 24 * 30}),
        secret:             config.session.sessionSecret,
        key:                config.session.sessionCookieKey,
        resave:             true,
        saveUninitialized:  true
        //cookie: { secure: true }
      })
    )
    app.use(passport.initialize())
    app.use(passport.session())

    //static files
    app.use('/public', express.static(path.join(__dirname, '..', '/public')))

    // initialize routes object to be used to bind express routes
    const aRoutes = fs.readdirSync('routes').filter(file => fs.lstatSync(path.join('routes', file)).isFile())
    let oRoutes = {}
    aRoutes.forEach(r => oRoutes[r] = require(path.join('..', 'routes', r)))

    //setup route handlers in the express app
    routes.forEach(route => {
      try {
        app[route.verb.toLowerCase()](route.path, oRoutes[route.file].default)
        log.debug(`Successfully bound route to express; method: ${route.verb}; path: ${route.path}`)
      } catch(err) {
        log.error(err, `Error binding route to express; method: ${route.verb}; path: ${route.path}`)
      }
    })

    //passport setup
    const strategies = fs.readdirSync("passport_strategies") || []
    strategies.forEach(stratFile => {
      try {
        const oStrat = require(`../passport_strategies/${stratFile}`).default(pgClient)
        if ((typeof oStrat.condition === 'undefined') || oStrat.condition) {
          const stratName = path.basename(stratFile, ".js")

          if (oStrat.options) return passport.use(stratName, new oStrat.strategy(oStrat.options, oStrat.handler))
          return passport.use(stratName, new oStrat.strategy(oStrat.handler))
        }

      } catch(err) {
        log.error(err)
      }
    })

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))

    httpServer.listen(config.server.port, () => log.info(`listening on *: ${config.server.port}`))

  } catch(err) {
    log.error("Error starting server", err)
    process.exit()
  }

  //handle if the process suddenly stops
  process.on('SIGINT', () => { console.log('got SIGINT....'); process.exit() })
  process.on('SIGTERM', () => { console.log('got SIGTERM....'); process.exit() })
}
