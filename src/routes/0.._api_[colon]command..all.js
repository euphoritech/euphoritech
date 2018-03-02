export default async function ApiCommand(req, res) {
  const command = req.params.command

  switch (command) {
    case 'login':
      return res.json(true)

    case 'session':
      return res.json({ session: (req.session) ? req.session.user : null })

    default:
      res.sendStatus(404)
  }
}
