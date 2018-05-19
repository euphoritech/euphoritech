export default class TeamDoesNotExist extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, TeamDoesNotExist)

    this.redirectRoute = '/autherror/teamdoesnotexist'
  }
}
