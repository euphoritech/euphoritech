export default class NoTeamError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, NoTeamError)

    this.redirectRoute = '/autherror/noteam'
  }
}
