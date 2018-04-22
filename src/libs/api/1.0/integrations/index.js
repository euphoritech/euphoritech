import SessionHandler from '../../../SessionHandler'
import TeamIntegrations from '../../../models/TeamIntegrations'

export default {
  async saveTeamIntegration({ req, res, postgres }) {
    const session       = SessionHandler(req.session)
    const integrations  = TeamIntegrations(postgres)
    const currentTeamId = session.getCurrentLoggedInTeam()
    const integrationId = req.body.int_id
    const intType       = req.body.type

    integrations.setRecord({
      team_id: currentTeamId,
      user_oauth_int_id: integrationId,
      integration_type: intType
    })
    const newId = await integrations.save()

    res.json({ id: newId })
  }
}
