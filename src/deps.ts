// remote
import Config = require('cli-engine-config')
import CLI = require('cli-ux')
import HTTP = require('http-call')
import CLIFlags = require('cli-flags')
import { Chalk } from 'chalk'
import list = require('cli-ux/lib/list')

// local
import help = require('./help')

export const deps = {
  // remote
  get cli(): typeof CLI.default {
    return fetch('cli-ux').default
  },
  get HTTP(): typeof HTTP.HTTP {
    return fetch('http-call').HTTP
  },
  get Config(): typeof Config {
    return fetch('cli-engine-config')
  },
  get CLIFlags(): typeof CLIFlags {
    return fetch('cli-flags')
  },
  get chalk(): Chalk {
    return fetch('chalk')
  },

  // local
  get Help(): typeof help.Help {
    return fetch('./help').Help
  },
  get renderList(): typeof list.renderList {
    return fetch('cli-ux/lib/list').renderList
  },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
