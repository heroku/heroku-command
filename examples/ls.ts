#!/usr/bin/env ts-node

import { Command, flags } from '..' // use cli-engine-command outside this repo
import { cli } from 'cli-ux'
import * as fs from 'fs'

class LS extends Command {
  static flags = {
    // run with --dir= or -d=
    dir: flags.string({
      char: 'd',
      default: process.cwd(),
    }),
  }

  async run() {
    let files = fs.readdirSync(this.flags.dir)
    for (let f of files) {
      cli.log(f)
    }
  }
}
LS.run()
