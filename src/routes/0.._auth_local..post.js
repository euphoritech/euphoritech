import passport from 'passport'

export default [
  passport.authenticate("local"),
  (req, res) => Routes.checkAndRedirect(req, res, '/')
]
