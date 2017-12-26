import { Chalk } from 'chalk'
import config = require('@cli-engine/config')
import CLIFlags = require('cli-flags')
import CLI = require('cli-ux')
import HTTP = require('http-call')

import help = require('./help')
import list = require('./list')
import screen = require('./screen')

export const deps = {
  // remote
  get cli(): typeof CLI.default  | undefined {
    try {
      return fetch('cli-ux').default
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') throw err
    }
  },
  get HTTP(): typeof HTTP.HTTP { return fetch('http-call').HTTP },
  get Config(): typeof config.Config { return fetch('@cli-engine/config').Config },
  get CLIFlags(): typeof CLIFlags { return fetch('cli-flags') },
  get chalk(): Chalk { return fetch('chalk') },

  // local
  get Help(): typeof help.Help { return fetch('./help').Help },
  get renderList(): typeof list.renderList { return fetch('./list').renderList },
  get screen(): typeof screen.default { return fetch('./screen').default },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
