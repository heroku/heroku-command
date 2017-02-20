// @flow

function termwidth (stream: any): number {
  if (!stream.isTTY) return 80
  let width = stream.getWindowSize()[0]
  return width < 30 ? 30 : width
}

export const stdtermwidth = termwidth(process.stdout)
export const errtermwidth = termwidth(process.stderr)
