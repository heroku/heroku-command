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
  api: require('./api'),
  app: require('./app'),
  mix
}
