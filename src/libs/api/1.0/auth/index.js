export default {
  session({ req, res }) {
    res.json({ session: req.session })
  },

  setRedirect({ req, res }) {
    req.session.returnTo = req.body.target
    req.session.save()
    res.json(null)
  }
}
