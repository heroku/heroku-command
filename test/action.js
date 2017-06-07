// @flow

import {SimpleAction} from '../src/output/action'
import Output from '../src/output'

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

async function run (out) {
  out.action.start('x foo')
  await wait()
  out.log('1 log')
  await wait()
  out.log('2 log')
  await wait()
  out.log('3 log')
  await wait()
  out.action.start('4 bar')
  await wait()
  out.action.stop('now it is done')
  await wait()
  out.action.start('5 foo')
  await wait()
  out.action.stop()
  await wait()
  out.action.start('6 warn')
  await wait()
  out.warn('uh oh')
  await wait()
  out.action.stop()
  await wait()
}

async function main () {
  let out = new Output()
  await run(out)
  out.action = new SimpleAction(out)
  await run(out)
}
main()
