import passport from 'passport'
import Routes from '../libs/Routes'

export default function AuthSlesforceCallback(req, res, next) {
  passport.authenticate("salesforce", function(err, user, info) {
    if (err)
      return next(err)

    return Routes.checkAndRedirect(req, res, '/')
  })(req, res, next)
}
