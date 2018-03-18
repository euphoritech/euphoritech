export default {
  close({ req, res }) {
    req.session.settings = null
    req.session.save()
    res.sendStatus(200)
  },

  open({ req, res }) {
    req.session.settings = {
      isOpen:   true,
      section:  req.body.section
    }
    req.session.save()
    res.sendStatus(200)
  },

  status({ req, res }) {
    res.json({ status: ((req.session) ? req.session.settings : null) || {} })
  }
}
