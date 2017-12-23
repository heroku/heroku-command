export function wait(ms: number, unref: boolean = false): Promise<void> {
  return new Promise(resolve => {
    let t: any = setTimeout(resolve, ms)
    if (unref) t.unref()
  })
}

export function timeout(p: Promise<any>, ms: number): Promise<void> {
  return Promise.race([p, wait(ms, true).then(() => require('debug')('cli')('timed out'))])
}
