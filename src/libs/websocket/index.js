import app from "./socketAppStore"
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
    socket.on('disconnect', disconnectSocket)

    if (user && user.id) {
      let realClientIpAddress = (req.headers['x-forwarded-for'] || req.ip || socket.handshake.address || "").split(',')
      realClientIpAddress = realClientIpAddress[realClientIpAddress.length - 1]

      let geoData
      try {
        geoData = (await GeoIP.location(realClientIpAddress)) || {}
      } catch(e) {
        log.error(`Error getting geo data for socket`, e)
        geoData = {}
      }

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

export function getSocketById(io, socketId, namespace='/') {
  return io.nsps[namespace].sockets[socketId]
}

export function addToRoom(socket, room) {
  const socketId = socket.id
  socket.join(room)

  app.rooms[room] = app.rooms[room] || []
  app.rooms[room].push(socketId)

  const userId = app.sockets[ socketId ]
  if (userId) {
    app.userRooms[userId] = app.userRooms[userId] || []
    app.userRooms[userId].push(room)
  }

  return room
}

export function disconnectSocket(socket) {
  const userId = app.sockets[ socket.id ]
  delete(app.sockets[ socket.id ])
  delete(app.users[ userId ])

  const userRooms = app.userRooms[userId]
  if (userRooms) {
    userRooms.forEach(r => app.rooms[room].splice(app.rooms[room].indexOf(socket.id), 1))
    delete(app.userRooms[userId])
  }
}
