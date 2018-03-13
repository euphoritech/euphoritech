export default class NoUserRecord extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, NoUserRecord)

    this.redirectRoute = '/autherror/nouser'
  }
}
