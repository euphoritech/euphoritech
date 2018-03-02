import Users from '../libs/models/Users'

export default function Logout(req, res) {
  const users = Users(null, req.session)
  users.logout()
  res.redirect("/")
}
