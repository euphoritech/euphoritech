import passport from 'passport'
import Routes from '../libs/Routes'

export default [
  passport.authenticate("github", { failureRedirect: '/' }),
  async function afterSuccessfulAuthGithub(req, res) {
    Routes.checkAndRedirect(req, res, '/')
  }
]
