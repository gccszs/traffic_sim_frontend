'use strict'

import { calcRotation } from './util'

const IMG_W = 40
const IMG_H = 20
const DRAW_W = 12
const DRAW_H = 9
const scale_x = DRAW_W / IMG_W
const scale_y = DRAW_H / IMG_H

const IMG01 = new Image()
//IMG01.src = 'car01.png'
const IMG02 = new Image()
//IMG02.src = 'car02.png'
const IMG03 = new Image()
//IMG03.src = 'car03.png'

const IMAGES = [IMG01, IMG02, IMG03]

class SimCar {
  constructor(props) {
    this.x = props.x
    this.y = props.y
    this.speed = props.speed
    this.last_x = this.x
    this.last_y = this.y
    this.rotation = 0
    this.last_rotation = 0
    this.road_id = props.road_id
    this.vehicle_id = props.vehicle_id
    this.timestamp = -1
    this.invalid = false
    this.color = Math.floor(Math.random() * IMAGES.length)
  }

  update(props) {
    this.speed = props.speed

    if (this.x === props.x && this.y === props.y) { return }
    if (props.x === 0 & props.y === 0) {
      this.invalid = true
      return
    }

    this.last_x = this.x
    this.last_y = this.y
    this.x = props.x
    this.y = props.y

    const dx = this.x - this.last_x
    const dy = this.y - this.last_y

    this.last_rotation = this.rotation
    this.rotation = calcRotation(dx, dy)

    this.timestamp = performance.now()
  }

  draw(ctx, time) {
    if (this.timestamp < 0) this.timestamp = time
    if (this.invalid) return

    ctx.save()
    const x = this.x
    const y = this.y

    ctx.translate(x, y)
    ctx.rotate(this.rotation)

    ctx.drawImage(IMAGES[this.color],
      0, 0, IMG_W, IMG_H,
      -IMG_W / 2 * scale_x, -IMG_H / 2 * scale_y,
      DRAW_W, DRAW_H)
    ctx.restore()
  }
}

export { SimCar }
