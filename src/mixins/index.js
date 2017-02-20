let mix = superclass => new MixinBuilder(superclass)

class MixinBuilder {
  constructor (superclass) {
    this.superclass = superclass
  }

  with (...mixins) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass)
  }
}

export {mix}
export {default as app} from './app'
export {default as heroku} from './heroku'
