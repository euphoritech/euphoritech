export default {
  rooms: {
    // Contains key/value pairs of [room]: [ socketId1, socketId2, ... ]
  },

  sockets: {
    // Contains key/value pairs of [socket_id]: userId
  },

  users: {
    // Contains key/value pairs of [user_id]: userInformationObject
    // { id: socketId, ... }
  }
}
