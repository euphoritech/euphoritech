import app from "./socketApp"
import Github from "./Github"
import Global from "./Global"
import GeoIP from "../GeoIP"

export default function WebSocket({ io, log, postgres, redis }) {
  io.on('connection', async socket => {
    const req   = socket.request
    const user  = req.session.user

    const handlers = {
      github: Github({ app, socket, log, io, postgres, redis }),
      global: Global({ app, socket, log, io, postgres, redis })
    }

    Object.keys(handlers).forEach(category => {
      Object.keys(handlers[category]).forEach(evt => {
        socket.on(evt, handlers[category][evt])
      })
    })

    if (user && user.id) {
      let realClientIpAddress = (req.headers['x-forwarded-for'] || req.ip || socket.handshake.address || "").split(',')
      realClientIpAddress = realClientIpAddress[realClientIpAddress.length - 1]

      const geoData = (await GeoIP.location(realClientIpAddress)) || {}

      app.sockets[ socket.id ] = user.id
      app.users[ user.id ] = {
        id: socket.id,
        date: new Date(),
        userName: user.name,
        userEmail: user.username_email,
        location: {
          ip: geoData.ip,
          city: geoData.city,
          state: geoData.region_name,
          stateCde: geoData.region_code,
          country: geoData.country_name,
          countryCde: geoData.country_code
        }
      }
    }
  })
}

export function addToRoom(socketId, room) {
  return socketApp.rooms[room] = socketId
}
