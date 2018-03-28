export default function Global({ app, socket, log }) {
  return {
    subscribe({ io }) {
      socket.emit('subscribeConfirm', { subscribe: true })
    }
  }
}
