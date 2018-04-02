import config from '../../../../config'

export default {
  hasIntegration({ req, res }) {
    const integrationType = req.query.type
    res.json(!!(config[integrationType] && config[integrationType].appId))
  }
}
