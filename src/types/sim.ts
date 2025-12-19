export interface Flow {
  road_id: number; //道路ID； 以下三个参数用于车辆(流)生成模型
  policy: number; //生成策略: 0-均匀分布;1-指数分布;2-伽马分布;3-正态分布
  demand: number; //车辆生成需求 车辆/分钟 -> 生成间隔;  1.0 / (demand / 60.0); 如果为-1则为动态
  extra: number; //额外参数 针对伽马分布与均匀分布 Gamma: 指数分布个数 Normal: 方差
}

export interface orgin {
  orgin_id: number; //OrginID就是LinkID
  dist: {
    dest: number; //终点ID
    percent: number; //车辆到达该终点的概率
  }[];
}

export interface signal {
  cross_id: number; //十字路口的ID；以下参数是针对Phase的
  cycle_time: number;
  ew_left: number;
  ew_straight: number;
  sn_left: number;
  sn_straight: number;
}

export interface FixedOD {
  road_num: number; //道路的数量
  lane_num: number; //每条道路单行道的数量
  controller_num: number; //十字路口(控制器)的数量
  follow_model: number; //全局跟驰模型: 1 - Gipps;2 - IDM; 3 - Newell
  change_lane_model: number; //全局换道模型: 1 - 匀加速换道模型； 2 - 自适应加速度换道模型
  flows: Flow[];
  od: orgin[];
  sg: signal[];
}

//仿真结构信息 包括路网json 和 OD参数等
export interface SimStructInfo {
  name: string; //仿真名称
  map_json: any; //路网json数据(xml转的json)
  map_pic: string; //路网base64数据
  fixed_od: FixedOD; //OD参数
}
