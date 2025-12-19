'use strict'

function resize(canvas) {
  const displayWidth = canvas.clientWidth
  const displayHeight = canvas.clientHeight

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }
}

function calcRotation(dx, dy) {
  return Math.atan2(dy, dx)
}

function randColor() {
  return `rgb(${randInt(255)}, ${randInt(255)}, ${randInt(255)})`
}

function randInt(range) {
  return Math.floor(Math.random() * range)
}
export { resize, calcRotation, randColor, randInt }
