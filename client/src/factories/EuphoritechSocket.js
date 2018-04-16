import socketIoClient from 'socket.io-client'

export default window.euphoritechSocket = window.euphoritechSocket || socketIoClient('http://localhost:8000')
