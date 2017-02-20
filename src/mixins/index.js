'use strict'

let mix = superclass => new MixinBuilder(superclass)

class MixinBuilder {
  constructor (superclass) {
    this.superclass = superclass
  }

  with (...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass)
  }
}

module.exports = {
  heroku: require('./heroku'),
  app: require('./app'),
  mix
}
