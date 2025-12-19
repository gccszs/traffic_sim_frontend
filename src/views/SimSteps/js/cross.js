'use strict'

class SimCross {
  constructor(props) {
    this.cross_id = props.cross_id
    this.type = props.type
    this.lane_number = props.lane_number
    this.lane_width = 10

    this.center = props.center
    this.connected_roads = props.connected_roads

    this.fill_style = '#646464'
    this.frame_style = '#FFFF00'
  }

  set_lanes(lane_number, roads) {
    function transform_point(center, point) {
      return {
        angle: Math.atan2(point.y - center.y, point.x - center.x),
        point: point
      }
    }

    const points = []
    for (const i of this.connected_roads) {
      // find nearest point to the cross center
      const lane = roads[i]
      const p0 = lane.points[0]
      const p1 = lane.points[lane.points.length - 1]
      const d0 = Math.pow(p0.x - this.center.x, 2) + Math.pow(p0.y - this.center.y, 2)
      const d1 = Math.pow(p1.x - this.center.x, 2) + Math.pow(p1.y - this.center.y, 2)
      if (d0 <= d1) {
        points.push(
          transform_point(this.center, lane.paths[0][0]),
          transform_point(this.center, lane.paths[2 * lane_number][0])
        )
      } else {
        points.push(
          transform_point(this.center, lane.paths[2 * lane_number][lane.points.length - 1]),
          transform_point(this.center, lane.paths[0][lane.points.length - 1])
        )
      }
    }

    // sorting points clockwise/counter-clockwise according angle
    points.sort((a, b) => a.angle - b.angle)

    this.points = points.map((e) => e.point)
  }

  draw(ctx) {
    ctx.save()

    ctx.fillStyle = this.fill_style
    ctx.strokeStyle = this.frame_style
    ctx.lineWidth = 2
    function draw_path(ctx, points) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
    }
    draw_path(ctx, this.points)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }
}

class SimLight {
  constructor(props) {
    this.light_id = props.light_id
    this.x = props.x
    this.y = props.y
    this.color = SimLight.colorMap[props.color]

    this.radius = 5
  }

  draw(ctx) {
    ctx.save()

    ctx.translate(this.x, this.y)

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  update(props) {
    this.color = SimLight.colorMap[props.color]
  }
}

SimLight.colorMap = {
  0: 'green',
  1: 'yellow',
  2: 'red'
}

export { SimCross, SimLight }
