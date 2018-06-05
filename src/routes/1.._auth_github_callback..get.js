import passport from 'passport'
import Routes from '../libs/Routes'

export default function AuthGithubCallback(req, res, next) {
  passport.authenticate("github", function(err, user, info) {
    if (err)
      return next(err)

    if (!user)
      return res.redirect('/gatekeeper/login')

    return Routes.checkAndRedirect(req, res, '/')
  })(req, res, next)
}
