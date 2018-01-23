import passport from 'passport'
import Routes from '../libs/Routes'

export default [
  passport.authenticate("google", { failureRedirect: '/' }),
  async function afterSuccessfulAuthGoogle(req, res) {
    Routes.checkAndRedirect(req, res, '/')
  }
]
