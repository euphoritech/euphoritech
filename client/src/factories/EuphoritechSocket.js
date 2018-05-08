import socketIoClient from 'socket.io-client'

// export default window.euphoritechSocket = window.euphoritechSocket || socketIoClient()
export default window.euphoritechSocket = window.euphoritechSocket || socketIoClient('ws://localhost:8000')
