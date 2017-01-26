'use strict'

class Command {
  constructor (options = {}) {
    this.argv = options.argv
    const mixins = this.constructor.mixins || []
    for (let mixin of mixins) mixin.call(this)
  }
}

module.exports = Command
