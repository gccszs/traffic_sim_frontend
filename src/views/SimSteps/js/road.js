'use strict'

class SimRoadCommon {
  constructor(props) {
    this.road = props.road
    this.points = props.points
    this.lane_number = props.lane_number
    this.lane_width = props.lane_width
    this.frame_style = '#FFFF00'
    this.fill_style = '#646464'
    this.lane_style = '#FFFFFF'
    this.line_width = 2
  }
}

class SimRoad extends SimRoadCommon {
  constructor(props) {
    super(props)

    this.set_lanes(this.lane_number)
  }

  set_lanes(lane_num) {
    this.lane_number = lane_num
    this.paths = new Array(this.lane_number * 2 + 1)
    for (let i = 0; i < this.paths.length; i++) {
      this.paths[i] = []
    }

    {
      let s = 0
      let c = 0
      const w = this.lane_width
      for (let i = 1; i < this.points.length; i++) {
        const p1 = this.points[i - 1]
        const p2 = this.points[i]

        const dis = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        )
        if (dis === 0) continue

        s = (p2.y - p1.y) / dis
        c = (p2.x - p1.x) / dis

        // mid point
        this.paths[this.lane_number].push(p1)

        // side points
        for (let i = 1; i <= this.lane_number; i++) {
          const d1 = { x: p1.x - s * w * i, y: p1.y + c * w * i } // left
          const d2 = { x: p1.x + s * w * i, y: p1.y - c * w * i } // right
          this.paths[this.lane_number - i].push(d1)
          this.paths[this.lane_number + i].push(d2)
        }
      }
      // last point
      const p = this.points[this.points.length - 1]
      this.paths[this.lane_number].push(p)
      for (let i = 1; i <= this.lane_number; i++) {
        const d1 = { x: p.x - s * w * i, y: p.y + c * w * i }
        const d2 = { x: p.x + s * w * i, y: p.y - c * w * i }
        this.paths[this.lane_number - i].push(d1)
        this.paths[this.lane_number + i].push(d2)
      }
    }

    this.border_path = this.paths[0].concat(
      [...this.paths[this.paths.length - 1]].reverse()
    )
  }

  draw(ctx) {
    ctx.save()

    ctx.fillStyle = this.fill_style
    ctx.strokeStyle = this.frame_style
    ctx.lineWidth = this.line_width

    function draw_path(ctx, points) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        ctx.lineTo(p.x, p.y)
      }
    }

    // road surface
    draw_path(ctx, this.border_path)
    ctx.fill()

    // lines
    for (let i = 0; i < this.paths.length; i++) {
      if (i % this.lane_number === 0) {
        ctx.strokeStyle = this.frame_style
        ctx.setLineDash([])
      } else {
        ctx.strokeStyle = this.lane_style
        ctx.setLineDash([7, 3])
      }

      draw_path(ctx, this.paths[i])
      ctx.stroke()
    }

    ctx.restore()
  }
}

class Link {
  constructor(props) {
    this.object_id = props.Object_ID
    this.road_id = props.Road_ID
    this.lane_number = props.Lane_Number
    this.path_id = props.Path_ID
  }
}

class Road {
  constructor() {
    this.road_id = undefined
    this.links = []
    this.path = []
    this.lane_number = 0
  }
}

class MarginalPoint {
  constructor(props) {
    this.road_id = props.Road_ID
    this.x = props.x
    this.y = props.y
  }

  draw(ctx) {
    ctx.save()

    // * 2021/4/23 此处是修改margin point处标记的样式
    // * 可能是setup界面的图
    // 绘制外框
    ctx.fillStyle = 'Yellow'
    // 在此处改变黄标框的大小和位置
    ctx.fillRect(this.x - 21, this.y - 21, 42, 42)

    // 绘制文字
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'center'
    // 在此处改变黄标框中字的大小和在黄框中的位置偏移量
    ctx.font = '30px Arial'
    ctx.fillText(this.road_id, this.x, this.y + 10)

    ctx.restore()
  }
}
// 画红绿灯编号
class CrossesPoint {
  constructor(props) {
    this.cross_id = props.Object_ID
    this.x = props.x
    this.y = props.y
  }

  draw(ctx) {
    ctx.save()

    // 绘制外框
    ctx.fillStyle = 'White'
    ctx.fillRect(this.x - 15, this.y - 15, 30, 30)

    // 绘制文字
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'center'
    ctx.font = '26px Arial'
    // 此处是用来标识红绿灯的编号
    ctx.fillText(this.cross_id + 1, this.x, this.y + 10)
    // ctx.fillText(this.cross_id, this.x, this.y + 10)

    ctx.restore()
  }
}

function process_road_data(roadData) {
  const roads = {}
  const marginals = []
  const Cross = []

  const data = roadData
  const links = data['Link']
  const baselines = data['Baseline']
  const crosses = data['Cross']
  const marginal_points = data['MarginalPoint']

  const paths = {}
  for (const b of baselines) {
    const points = b.Points.replace(/,$/, '').split(/,| /)
    paths[b.Path_ID] = []

    for (let i = 0; i < points.length; i += 2) {
      const point = {
        x: parseInt(points[i]),
        y: parseInt(points[i + 1])
      }
      paths[b.Path_ID].push(point)
    }
  }

  for (const c of crosses) {
    c.Center = {
      x: parseInt(c.x),
      y: parseInt(c.y)
    }
    c.ConnectedRoads = []
  }

  for (const l of links) {
    const link = new Link(l)
    let road = roads[link.Road_ID]

    if (road === undefined) {
      road = new Road()
      road.road_id = link.road_id
      road.lane_number = parseInt(link.lane_number)
      roads[road.road_id] = road
    }

    // connected cross
    if (l.Link_End.Object_Type === 'C') {
      const c = crosses[l.Link_End.Object_ID]
      if (!c.ConnectedRoads.includes(l.Road_ID)) {
        c.ConnectedRoads.push(l.Road_ID)
      }
    }
    if (l.Link_Start.Object_Type === 'C') {
      const c = crosses[l.Link_Start.Object_ID]
      if (!c.ConnectedRoads.includes(l.Road_ID)) {
        c.ConnectedRoads.push(l.Road_ID)
      }
    }

    road.links.push(link)
    road.path = paths[link.path_id]
  }

  for (const p of marginal_points) {
    marginals.push(new MarginalPoint(p))
  }
  for (const p of crosses) {
    Cross.push(new CrossesPoint(p))
  }

  return {
    roads: roads,
    crosses: crosses,
    marginal_points: marginals,
    crosses_points: Cross
  }
}

export { process_road_data, SimRoad }
