import SessionHandler from '../../../SessionHandler'
import TeamIntegrations from '../../../models/TeamIntegrations'

export default {
  async saveTeamIntegration({ req, res, postgres, redis }) {
    const sessionHandler  = SessionHandler(req.session, { redis })
    const integrations    = TeamIntegrations(postgres)
    const currentTeamId   = sessionHandler.getCurrentLoggedInTeam()
    const currentUserId   = sessionHandler.getLoggedInUserId()
    const teamInteg       = sessionHandler.getLoggedInUserIntegrations()
    const intType         = req.body.type

    const integration = teamInteg[intType]

    if (integration) {
      await integrations.findOrCreateBy({ team_id: currentTeamId, integration_type: intType })
      integrations.setRecord({ user_oauth_int_id: integration.id })
      const newId = await integrations.save()
      await sessionHandler.resetTeamSessionRefresh(currentTeamId)

      return res.json({ id: newId })
    }

    res.status(404).json({ error: res.__(`We could not find your integration. Make sure you've authenticated and try again.`) })
  }
}
