import passport from 'passport'

export default passport.authenticate("google", {
  scope: [ "profile", "email" ],
  accessType: 'offline'   //returns the refresh token
})
