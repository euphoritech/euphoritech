import { addToRoom } from './index'
import SessionHandler from '../SessionHandler'
import Users from '../models/Users'

export default function Global({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const sessionHandler = SessionHandler(req.session, { redis })
  const users = Users(postgres, req.session)

  return {
    subscribe() {
      const loggedIn = users.isLoggedIn()
      socket.emit('isLoggedIn', loggedIn)

      if (loggedIn) {
        const teamId = sessionHandler.getCurrentLoggedInTeam
        addToRoom(socket, `team_${teamId}`)
      }
    }
  }
}
