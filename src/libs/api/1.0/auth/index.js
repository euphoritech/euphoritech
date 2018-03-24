export default {
  session({ req, res }) {
    res.json({ session: req.session })
  }
}
