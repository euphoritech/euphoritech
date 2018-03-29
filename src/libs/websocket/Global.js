export default function Global({ app, socket, log, io, postgres, redis }) {
  return {
    subscribe(data) {
      console.log("MY DATA", data)
      socket.emit('subscribeConfirm', { subscribe: true })
    }
  }
}
