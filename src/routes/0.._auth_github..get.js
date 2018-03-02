import passport from 'passport'

export default passport.authenticate("github", { scope: [ 'repo', 'read:org', 'user' ] })
