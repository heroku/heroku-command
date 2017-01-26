'use strict'

module.exports = {
  Command: require('./lib/command'),
  convertLegacy: require('./lib/legacy'),
  api: require('./lib/mixins/api'),
  app: require('./lib/mixins/app'),
  auth: require('./lib/mixins/auth')
}
