// @flow
/* globals
   $Shape
   Class
 */

import http from './http'
import type HTTP from 'http-call'
import Output from './output'
import Parser from './parser'
import pjson from '../package.json'
import {type Config, Default as DefaultConfig} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'

export default class Command extends Output {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: ?string[]

  static _version: pjson.version

  static _flags: Flag[] = [
    {name: 'debug', hidden: true},
    {name: 'no-color', hidden: true}
  ]

  static _args: Arg[] = []

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  static get flags () { return this._flags }
  static set flags (flags: Flag[]) { this._flags.push(...flags) }

  static get args () { return this._args }
  static set args (args: Arg[]) { this._args.push(...args) }

  constructor (argv: string[] = [], config: $Shape<Config> = {}) {
    super(Object.assign(DefaultConfig, config))
    this.argv = argv
    this.parser = new Parser(this)
    this.http = http(this)
  }

  argv: string[]
  flags: {[flag: string]: string | true}
  args: {[arg: string]: string}

  parser: Parser
  http: Class<HTTP>

  /**
   * get whether or not command is in debug mode
   * @returns {number} - 0 if not debugging, otherwise current debug level (1 or 2 usually)
   */
  get debugging (): number {
    if (this.flags && this.flags.debug) return 1
    const HEROKU_DEBUG = process.env.HEROKU_DEBUG
    if (HEROKU_DEBUG === 'true') return 1
    if (HEROKU_DEBUG) return parseInt(HEROKU_DEBUG)
    return 0
  }

  async init () {
    await this.parser.parse()
    await super.init()
    this.flags = this.parser.flags
    this.args = this.parser.args
  }

  /**
   * actual command run code goes here
   */
  async run () {
    throw new Error('must implement abstract class Command')
  }

  async done () {
    await super.done()
  }
}
