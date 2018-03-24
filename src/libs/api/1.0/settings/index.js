export default {
  close({ req, res }) {
    req.session.settings = null
    req.session.save()
    res.status(200).json(null)
  },

  open({ req, res }) {
    req.session.settings = {
      isOpen:   true,
      section:  req.body.section
    }
    req.session.save()
    res.status(200).json(null)
  },

  status({ req, res }) {
    res.json({ status: ((req.session) ? req.session.settings : null) || {} })
  }
}
