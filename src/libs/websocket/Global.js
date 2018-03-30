import Users from '../models/Users'

export default function Global({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const users = Users(postgres, req.session)

  return {
    subscribe() {
      socket.emit('isLoggedIn', users.isLoggedIn())
    }
  }
}
