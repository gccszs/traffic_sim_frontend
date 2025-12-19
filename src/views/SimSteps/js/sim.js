'use strict'

import { SimCar } from './car'
import { process_road_data, SimRoad } from './road'
import { SimCross, SimLight } from './cross.js'


/**
 * SimCanvas 用于画仿真图
 * @typedef {Object} SimCanvas
 * @property {any} canvas - 画布
 * @property {any} options - 选项
 */
class SimCanvas {
  constructor(canvas, options) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    this.dragging = false

    this.translation = [0, 0]
    this.scaling = [1.0, 1.0]

    this.clear()

    // 处理选项
    options = options || {}

    if (options.draw_label === undefined) { options.draw_label = false }
    if (options.draw_label2 === undefined) { options.draw_label2 = false }

    this.draw_label = options.draw_label
    this.draw_label2 = options.draw_label2
  }

  // / 清除数据
  clear() {
    // 绘制需要的数据
    this.roads = {}
    this.crosses = {}
    this.cars = {}
    this.lights = {}
    this.marginals = []
    this.marginalscross = []
    this.draw_label = false
    this.draw_label2 = false
  }

  // / 调整画布大小
  resize() {
    // 保持画布显示大小和其实际大小一致
    const displayWidth = this.canvas.clientWidth
    const displayHeight = this.canvas.clientHeight

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth
      this.canvas.height = displayHeight
    }
  }

  // 绘制canvas画布
  draw(time) {
    // 绘制前保存状态（transform等）
    this.context.save()

    // * 2021/4/23 用深蓝色覆盖整个canvas
    // 清除画布
    this.context.fillStyle = '#394056'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 更新transform
    this.context.translate(this.translation[0], this.translation[1])
    this.context.scale(this.scaling[0], this.scaling[1])

    // 绘制元素
    this._draw(time)

    this.context.restore()
  }

  // 绘制元素
  _draw(time) {
    // 静态元素先绘制
    for (const road in this.roads) this.roads[road].draw(this.context)

    for (const cross in this.crosses) this.crosses[cross].draw(this.context)
    // for (const tree in this.trees) this.trees[tree].draw(this.content)
    if (this.draw_label) {
      for (const mar of this.marginals) mar.draw(this.context)
      // for (const mar of this.marginalscross) mar.draw(this.context)
    }
    if (this.draw_label2) {
      // TODO:在此处添加红绿灯编号
      for (const mar of this.marginalscross) mar.draw(this.context)
    }
    // 绘制动态元素
    //for (const car in this.cars) this.cars[car].draw(this.context, time)
    //for (const light in this.lights) this.lights[light].draw(this.context)
  }

  // / 更新车辆和红路灯数据
  update(data) {
    for (const veh of data['vehicles']) {
      let car = this.cars[veh.vehicleID]
      if (car === undefined) {
        car = new SimCar({
          x: veh.xPosition,
          y: veh.yPosition,
          speed: veh.speed,
          vehicle_id: veh.vehicleID,
          road_id: veh.roadId
        })
        this.cars[veh.vehicleID] = car
      } else {
        car.update({
          x: veh.xPosition,
          y: veh.yPosition,
          speed: veh.speed
        })
      }
    }

    for (const p of data['phases']) {
      let light = this.lights[p.phaseId]
      if (light === undefined) {
        light = new SimLight({
          color: p.color,
          x: p.xPosition,
          y: p.yPosition,
          light_id: p.phaseId
        })
        this.lights[p.phaseId] = light
      } else {
        light.update({
          color: p.color
        })
      }
    }
  }

  // / 重置transform（居中显示）
  reset_transform() {
    this.scaling = [1.0, 1.0]

    let size = 0
    const center = { x: 0, y: 0 }
    for (const cross in this.crosses) {
      size += 1
      center.x += this.crosses[cross].center.x
      center.y += this.crosses[cross].center.y
    }
    if (size !== 0) {
      center.x /= size
      center.y /= size
    }
    this.translation = [
      -center.x + this.canvas.width / 2,
      -center.y + this.canvas.height / 2
    ]
  }

  // / 更改车道数
  change_lane_num(lane_num) {
    for (const road in this.roads) {
      this.roads[road].set_lanes(lane_num)
    }
    for (const cross in this.crosses) {
      this.crosses[cross].set_lanes(lane_num, this.roads)
    }

    this.reset_transform()
  }

  // / 设置道路数据
  set_road(road_data, lane_num) {
    set_road(this, road_data, lane_num)

    //不再使用移动偏移的方式, 而是数据一开始就减了min_x和min_y, 改为相对的
    //this.reset_transform()
  }

  // / 生成图片
  get_image() {
    // 至少绘制一次
    this.draw(0)
    return this.canvas.toDataURL('image/png')
  }
}

// 设置SimCanvas道路数据
function set_road(sim_canvas, road_data, lane_num) {
  // 清除
  if (Object.keys(sim_canvas.roads).length !== 0) {
    sim_canvas.clear()
  }

  const data = process_road_data(road_data)
  for (const k in data.roads) {
    const r = data.roads[k]
    const road = new SimRoad({
      road: r,
      points: r.path,
      lane_number: lane_num,
      lane_width: 10
    })
    sim_canvas.roads[r.road_id] = road
  }

  for (const c of data.crosses) {
    const cross = new SimCross({
      cross_id: c.Cross_Id,
      type: c.Cross_Type,
      center: c.Center,
      connected_roads: c.ConnectedRoads,
      lane_number: lane_num
    })

    cross.set_lanes(lane_num, sim_canvas.roads)
    sim_canvas.crosses[c.Cross_Id] = cross
  }

  sim_canvas.marginals = data.marginal_points
  sim_canvas.marginalscross = data.crosses_points
}

const extra_x = 100;
const extra_y = 100;

/**
 * 生成道路缩略图，返回值为dataURL
 * @returns {string} 缩略图的URL
 */
function generate_thumbnail(road_data, lane_num, displayroadNume, displaycrossNume) {
  const xarray = []
  const yarray = []
  const baseline = road_data['Baseline']
  for (const b of baseline) {
    const points = b.Points.replace(/,$/, '').split(/,| /)
    for (let i = 0; i < points.length; i += 2) {
      xarray.push(parseInt(points[i]))
      yarray.push(parseInt(points[i + 1]))
    }
  }
  // xlength:道路左右两边的最大宽度
  // ylength:道路上下的最大高度
  const max_x = Math.max.apply(null, xarray), min_x = Math.min.apply(null, xarray);
  const max_y = Math.max.apply(null, yarray), min_y = Math.min.apply(null, yarray);

  const xlength = max_x - min_x;
  const ylength = max_y - min_y;
  const canvas = document.createElement('canvas');
  // if ((extra_x%2) != 0) extra_x += 1; //不是偶数改为偶数
  // if ((extra_y%2) != 0) extra_y += 1;

  canvas.width = xlength + extra_x;
  canvas.height = ylength + extra_y;
  
  const padding_x = extra_x / 2, padding_y = extra_y / 2;
  const road_data_copy = JSON.parse(JSON.stringify(road_data));
  //处理road_data, 将所有坐标数据全部减去min_x和min_y;
  road_data_copy.MarginalPoint.forEach((item) => {
    // item.x = ((parseInt(item.x) - min_x) + padding_x).toString(); 
    // item.y = ((parseInt(item.y) - min_y) + padding_y).toString();
    // item.x = parseInt(item.x) - min_x + padding_x
    // item.y = parseInt(item.y) - min_y + padding_y
    item.x = parseInt(item.x)
    item.y = parseInt(item.y)
  });

  road_data_copy.Cross.forEach((item) => {
    item.x = parseInt(item.x) - min_x + padding_x
    item.y = parseInt(item.y) - min_y + padding_y
  });

  road_data_copy.Baseline.forEach((item) => {
    // 处理 Points 字段
    const points = item.Points.split(","); // 以逗号分隔
    const updatedPoints = points.map((point) => {
      // 修改坐标，将所有坐标值-min_x/y
      const coords = point.trim().split(" "); // 将每个坐标对分隔为 X 和 Y
      if (coords.length === 2) {
        const x = parseInt(coords[0]);
        const y = parseInt(coords[1]);
        return `${(x - min_x) + padding_x} ${(y - min_y) + padding_y}`;
      }
      return point;
    }).join(","); // 重新组合为字符串

    item.Points = updatedPoints;
  });
  
  const sim_canvas = new SimCanvas(canvas, { register_event: false, draw_label: displayroadNume, draw_label2: displaycrossNume });
  sim_canvas.set_road(road_data_copy, lane_num);

  return sim_canvas.get_image();
}

/**
 * @description 拿到生成的缩略图的路网地图的左上角xy 或 路网的真实最小xy
 * @param road_data 路网数据 
 * @param type 'min'/'max'获取路网的真实最小/大xy 'start'获取左上角xy
 */
function get_roadnetwork_xy(road_data, type) {
  const xarray = []
  const yarray = []
  const baseline = road_data['Baseline']
  for (const b of baseline) {
    const points = b.Points.replace(/,$/, '').split(/,| /)
    for (let i = 0; i < points.length; i += 2) {
      xarray.push(parseInt(points[i]))
      yarray.push(parseInt(points[i + 1]))
    }
  }

  if (type == 'min') {
    const min_x = Math.min.apply(null, xarray);
    const min_y = Math.min.apply(null, yarray);
    return {x: min_x, y: min_y};
  } else if (type == 'max'){
    const max_x = Math.max.apply(null, xarray);
    const max_y = Math.max.apply(null, yarray);
    return {x: max_x, y: max_y};
  } else if (type == 'start') {
    return {x: extra_x / 2, y: extra_y / 2};
  }
  return {x: 0, y: 0}
}

export { SimCanvas, generate_thumbnail, get_roadnetwork_xy};
