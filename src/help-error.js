// @flow

export default class HelpError extends Error {
  constructor (message?: string) {
    super(message)
    if (message) this.message = message
    this.name = 'HelpError'
  }
}
