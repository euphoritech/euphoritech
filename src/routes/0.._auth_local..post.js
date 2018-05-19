import passport from 'passport'
import Routes from '../libs/Routes'

export default [
  passport.authenticate("local"),
  (req, res) => Routes.checkAndRedirect(req, res, '/')
]
