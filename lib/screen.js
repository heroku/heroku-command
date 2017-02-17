'use strict'

function errtermwidth () {
  if (!process.stderr.isTTY) return 80
  let width = process.stderr.getWindowSize()[0]
  return width < 30 ? 30 : width
}

module.exports = {
  errtermwidth
}
