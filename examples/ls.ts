#!/usr/bin/env ts-node

const { Command, flags } = require('..') // change to 'cli-engine-command' when used outside this repo
const fs = require('fs')

class LS extends Command {
  static flags = {
    dir: flags.string({
      char: 'd',
      default: process.cwd(),
    }),
  }

  async run() {
    let files = fs.readdirSync(this.flags.dir)
    for (let f of files) {
      this.out.log(f)
    }
  }
}
LS.run()
