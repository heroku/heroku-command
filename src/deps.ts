import Help = require('./help')
import Color = require('./color')

import Config = require('cli-engine-config')
import CLI = require('cli-ux')
import CLIFlags = require('cli-flags')
import HTTP = require('http-call')

export const deps = {
  // local
  get Color(): typeof Color { return fetch('./color') },
  get Help(): typeof Help.Help { return fetch('./help').Help },

  // remote
  get Config(): typeof Config { return fetch('cli-engine-config')},
  get CLI(): typeof CLI.default { return fetch('cli-ux').default },
  get CLIFlags(): typeof CLIFlags { return fetch('cli-flags') },
  get HTTP(): typeof HTTP.HTTP { return fetch('http-call').HTTP },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}
