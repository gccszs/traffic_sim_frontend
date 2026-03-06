import * as PIXI from "pixi.js";

type VehClickCb = (veh: Veh) => void;
type PhaseClickCb = (phase: Phase) => void;

export class Veh {
  // 成员变量，默认为空
  private id?: number;
  private in_cross?: boolean;
  private cross_id?: number;
  private cross_lane_id?: number;
  private cross_cell_id?: number;
  private link_id?: number;
  private lane_id?: number;
  private cell_id?: number;
  private x?: number;
  private y?: number;
  private cur_spd?: number;
  private last_spd?: number;
  private router?: number[];

  // 构造函数，所有字段可选，默认值为空
  constructor(
    id?: number,
    in_cross?: boolean,
    cross_id?: number,
    cross_lane_id?: number,
    cross_cell_id?: number,
    link_id?: number,
    lane_id?: number,
    cell_id?: number,
    x?: number,
    y?: number,
    cur_spd?: number,
    last_spd?: number,
    router?: number[]
  ) {
    if (id !== undefined) this.id = id;
    if (in_cross !== undefined) this.in_cross = in_cross;
    if (cross_id !== undefined) this.cross_id = cross_id;
    if (cross_lane_id !== undefined) this.cross_lane_id = cross_lane_id;
    if (cross_cell_id !== undefined) this.cross_cell_id = cross_cell_id;
    if (link_id !== undefined) this.link_id = link_id;
    if (lane_id !== undefined) this.lane_id = lane_id;
    if (cell_id !== undefined) this.cell_id = cell_id;
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (cur_spd !== undefined) this.cur_spd = cur_spd;
    if (last_spd !== undefined) this.last_spd = last_spd;
    if (router !== undefined) this.router = router;
  }

  // 获取和设置方法

  // id
  getId(): number | undefined {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

  // in_cross
  getInCross(): boolean | undefined {
    return this.in_cross;
  }

  setInCross(in_cross: boolean): void {
    this.in_cross = in_cross;
  }

  // cross_id
  getCrossId(): number | undefined {
    return this.cross_id;
  }

  setCrossId(cross_id: number): void {
    this.cross_id = cross_id;
  }

  // cross_lane_id
  getCrossLaneId(): number | undefined {
    return this.cross_lane_id;
  }

  setCrossLaneId(cross_lane_id: number): void {
    this.cross_lane_id = cross_lane_id;
  }

  // cross_cell_id
  getCrossCellId(): number | undefined {
    return this.cross_cell_id;
  }

  setCrossCellId(cross_cell_id: number): void {
    this.cross_cell_id = cross_cell_id;
  }

  // link_id
  getLinkId(): number | undefined {
    return this.link_id;
  }

  setLinkId(link_id: number): void {
    this.link_id = link_id;
  }

  // lane_id
  getLaneId(): number | undefined {
    return this.lane_id;
  }

  setLaneId(lane_id: number): void {
    this.lane_id = lane_id;
  }

  // cell_id
  getCellId(): number | undefined {
    return this.cell_id;
  }

  setCellId(cell_id: number): void {
    this.cell_id = cell_id;
  }

  // x
  getX(): number | undefined {
    return this.x;
  }

  setX(x: number): void {
    this.x = x;
  }

  // y
  getY(): number | undefined {
    return this.y;
  }

  setY(y: number): void {
    this.y = y;
  }

  // cur_spd
  getCurSpd(): number | undefined {
    return this.cur_spd;
  }

  setCurSpd(cur_spd: number): void {
    this.cur_spd = cur_spd;
  }

  // last_spd
  getLastSpd(): number | undefined {
    return this.last_spd;
  }

  setLastSpd(last_spd: number): void {
    this.last_spd = last_spd;
  }

  // router
  getRouter(): number[] | undefined {
    return this.router;
  }

  setRouter(router: number[]): void {
    this.router = router;
  }
}

export class Phase {
  // 定义成员变量，默认为空
  private id: number | undefined;
  private color: string | undefined;
  private x: number | undefined;
  private y: number | undefined;

  // 构造函数，可以选择性传入参数
  constructor(id?: number, color?: string, x?: number, y?: number) {
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  // Getter 和 Setter 方法

  // id
  getId(): number | undefined {
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }

  // color
  getColor(): string | undefined {
    return this.color;
  }

  setColor(color: string): void {
    this.color = color;
  }

  // x
  getX(): number | undefined {
    return this.x;
  }

  setX(x: number): void {
    this.x = x;
  }

  // y
  getY(): number | undefined {
    return this.y;
  }

  setY(y: number): void {
    this.y = y;
  }
}

class PhasePIXI extends Phase {
  private m_phase_graphics:PIXI.Graphics | undefined;

  constructor(graphics?:PIXI.Graphics, id?: number, color?: string, x?: number, y?: number) {
    super(id, color, x, y);
    this.m_phase_graphics = graphics;
  }

  getPhaseGraphics() {
    return this.m_phase_graphics;
  }

  setPhaseGraphics(graphics:PIXI.Graphics) {
    this.m_phase_graphics = graphics;
  }

}

class Cross {
  // 定义成员变量
  private id: number;
  private phases: PhasePIXI[];

  // 构造函数
  constructor(id: number) {
    this.id = id;
    this.phases = []; // 初始化为空数组
  }

  // 获取 Cross 的 id
  getId(): number {
    return this.id;
  }

  // 设置 Cross 的 id
  setId(id: number): void {
    this.id = id;
  }

  // 获取所有 Phase 对象
  getPhases(): Phase[] {
    return this.phases;
  }

  // 向 Cross 中添加一个 Phase 对象
  addPhase(phase: PhasePIXI): void {
    this.phases.push(phase);
  }

  // 根据 id 查找指定的 Phase
  getPhaseById(id: number): PhasePIXI | undefined {
    return this.phases.find(phase => phase.getId() === id);
  }

  // 删除指定 id 的 Phase
  removePhaseById(id: number): void {
    this.phases = this.phases.filter(phase => phase.getId() !== id);
  }
}

class VehPIXI extends Veh {
  private m_veh_sprite: PIXI.Sprite | undefined;
  private m_last_x: number;
  private m_last_y: number;

  constructor(sprite?:PIXI.Sprite,
    id?: number,
    in_cross?: boolean,
    cross_id?: number,
    cross_lane_id?: number,
    cross_cell_id?: number,
    link_id?: number,
    lane_id?: number,
    cell_id?: number,
    x?: number,
    y?: number,
    cur_spd?: number,
    last_spd?: number,
    router?: number[]) {
    super(id, in_cross, cross_id, cross_lane_id, cross_cell_id, link_id, lane_id, cell_id, x, y, cur_spd, last_spd, router);
    this.m_veh_sprite = sprite;
    this.m_last_x = -1;
    this.m_last_y = -1;
  }

  getVehSprite() {
    return this.m_veh_sprite;
  }

  setVehSprite(sprite:PIXI.Sprite) {
    this.m_veh_sprite = sprite;
  } 

  getLastX() {
    return this.m_last_x;
  }

  setLastX(value:number) {
    this.m_last_x = value;
  }

  getLastY() {
    return this.m_last_y;
  }

  setLastY(value:number) {
    this.m_last_y = value;
  }

}

//路网背景图的数据
class RoadNetworkBgInfo {
  public img_url:string;    //路网图片url
  public rn_min_x:number;   //XML中的最小x
  public rn_min_y:number;   //XML中的最小y
  public rn_max_x:number;   //XML中的最大X
  public rn_max_y:number;   //XML中的最大y
  public rn_start_x:number; //路网图片中路网部分的左上角x
  public rn_start_y:number; //路网图片中路网部分的左上角y

  public img_sprite:PIXI.Sprite | undefined;

  constructor() {
    this.img_url = '';
    this.rn_min_x = 0;  
    this.rn_min_y = 0;
    this.rn_max_x = 0;
    this.rn_max_y = 0;
    this.rn_start_x = 0; 
    this.rn_start_y = 0;
  }
}

export class SimPIXI {
  private m_app!: PIXI.Application<HTMLCanvasElement>;
  private m_width: number;
  private m_height: number;
  private m_world_container!: PIXI.Container; //所有元素的容器
  private m_mouse_down_point: PIXI.Point; //鼠标按下时的XY(相对于容器)
  private m_cur_click_target:any;         //当前鼠标点击的元素
  private m_veh_dragging:boolean;         //是否正在拖拽车辆
  private m_clickdown_veh_cb:VehClickCb | undefined;        //点击车辆时调用的回调函数
  private m_clickup_veh_cb:VehClickCb | undefined;      //抬起鼠标时车辆回调函数
  private m_click_phase_cb:PhaseClickCb | undefined;    //点击Phase时调用的回调函数

  private m_bg: RoadNetworkBgInfo;  //路网图片信息
  private m_vehs: VehPIXI[];        //所有的车辆
  private m_crosses: Cross[];   //所有的路口(Phase)

  private m_world_scale:number;     //缩放比例
  private m_veh_scale:number;       //车辆缩放比例

  constructor(width:number, height:number) {
    this.m_width = width;
    this.m_height = height;
    this.m_vehs = [];
    this.m_crosses = [];
    this.m_bg = new RoadNetworkBgInfo();
    this.m_mouse_down_point = new PIXI.Point(0, 0);
    this.m_cur_click_target = null;
    this.m_veh_scale = 0.3;
    this.m_world_scale = 1;
    this.m_veh_dragging = false;
  }

  /**
   * @description 附加到仿真动画PIXI画布
   * @param ele_id 要附加到的DOM元素id
   * @returns 是否创建成功
   */
  appendSimPIXI(ele_id:string): boolean{
    // 获取DOM元素
    const ele = document.getElementById(ele_id) as HTMLCanvasElement;
    if (ele == null) return false;

    this.m_app = new PIXI.Application<HTMLCanvasElement>({
      width: this.m_width,
      height: this.m_height,
      backgroundColor: 0xf7f4ed,
      view: ele,
    });
    this.m_app.stage.eventMode = 'static';
    this.m_app.stage.hitArea = this.m_app.screen;

    this.m_world_container = new PIXI.Container();
    this.m_world_container.cursor = 'move';
    this.m_world_container.eventMode = 'static';
    this.m_app.stage.addChild(this.m_world_container);

    const func_on_drag_end = (event:PIXI.FederatedPointerEvent) => {
      if (this.m_cur_click_target == this.m_world_container) {
        this.m_cur_click_target.alpha = 1;
        const offset_x = event.global.x - this.m_mouse_down_point.x;
        const offset_y = event.global.y - this.m_mouse_down_point.y;
        this.m_cur_click_target.x += offset_x;
        this.m_cur_click_target.y += offset_y;
      }
      this.m_cur_click_target = null;
    };

    this.m_world_container.on('pointerdown', (event:PIXI.FederatedPointerEvent) => {
      if (this.m_cur_click_target === null) {
        this.m_cur_click_target = this.m_world_container;

        this.m_world_container.alpha = 0.7;
        this.m_mouse_down_point.x = event.global.x;
        this.m_mouse_down_point.y = event.global.y;
      }
    });//拖动container

    this.m_app.stage.on('pointerup', func_on_drag_end);
    this.m_app.stage.on('pointerupoutside', func_on_drag_end);

    this.m_world_container.on('pointermove', (event:PIXI.FederatedPointerEvent) => {
      if (this.m_veh_dragging) {
        const target = this.m_cur_click_target;
        if (target instanceof PIXI.Sprite) {
          const mousePosition = event.getLocalPosition(target.parent);
          target.x = mousePosition.x;
          target.y = mousePosition.y;
        }
      }
    });

    this.m_world_container.on('pointerup', (event:PIXI.FederatedPointerEvent) => {
      if ((this.m_cur_click_target !== null) && (this.m_cur_click_target != this.m_world_container)) {
        if (this.m_cur_click_target instanceof PIXI.Sprite) {
          this.m_cur_click_target.scale.set(this.m_veh_scale);
          this.m_cur_click_target.alpha = 1;
          this.m_veh_dragging = false;
        }

        this.m_cur_click_target = null;
      }
    });//拖动车辆

    //缩放: https://juejin.cn/post/7225565801792946234#heading-19
    this.m_app.view.addEventListener('wheel', (event:WheelEvent) => {
      event.preventDefault();
      const zoomFactor = 0.1;
      const scaleDelta = event.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;
      
      // 更新缩放比例，并确保缩放范围在合理区间
      this.m_world_scale *= scaleDelta;
      this.m_world_scale = Math.max(0.1, Math.min(5, this.m_world_scale));
      
      // 应用缩放
      this.m_app.stage.scale.x = this.m_world_scale;
      this.m_app.stage.scale.y = this.m_world_scale;
      
      // 确保缩放后元素仍然可见
      event.stopPropagation();
    });

    this.m_app.stage.sortableChildren = true;

    // Add the assets to load
    PIXI.Assets.add({ alias: "car_green", src: "/sim_imgs/car01.png" });
    PIXI.Assets.add({ alias: "car_gray", src: "/sim_imgs/car02.png" });
    PIXI.Assets.add({ alias: "car_red", src: "/sim_imgs/car03.png" });

    // 创建一个提示文本并放到画布中间
    let style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });

    let loading_msg = new PIXI.Text("正在加载", style);
    loading_msg.position.set(
      this.m_app.screen.width / 2 - 30,
      this.m_app.screen.height / 2
    );
    this.m_app.stage.addChild(loading_msg);

    // 加载资源
    const texturesPromise = PIXI.Assets.load(
      ["car_green", "car_gray", "car_red"],
      (process) => {
        console.log("[Debug] PIXI.Assets加载进度：" + process);
        loading_msg.text = "正在加载: " + process;
      }
    );

    texturesPromise.then((textures) => {
      loading_msg.text = "资源加载完毕!";
      this.m_app.stage.removeChild(loading_msg);
    });
    
    return true;
  }

  /**
   * @description 设置路网背景图
   * @param img 图片base64 Url
   */
  setRoadNetworkBg(img:string, min_x?:number, min_y?:number, max_x?:number, max_y?:number, start_x?:number, start_y?:number) {
    this.m_bg.img_url = img;
    if (min_x !== undefined) this.m_bg.rn_min_x = min_x;
    if (min_y !== undefined) this.m_bg.rn_min_y = min_y;
    if (max_x !== undefined) this.m_bg.rn_max_x = max_x;
    if (max_y !== undefined) this.m_bg.rn_max_y = max_y;
    if (start_x !== undefined) this.m_bg.rn_start_x = start_x;
    if (start_y !== undefined) this.m_bg.rn_start_y = start_y;

    if (this.m_bg.img_sprite !== undefined) {
      this.m_world_container.removeChild(this.m_bg.img_sprite);
    }

    let image = new Image();
    image.src = img;
    image.onload = () => {
      let background: PIXI.Sprite = PIXI.Sprite.from(image);
      //background.width = this.m_app.screen.width;
      //background.height = this.m_app.screen.height;
      background.zIndex = -1; //放到最底层 (没有作用, 之后再改)
      this.m_world_container.addChild(background);

      // 重置world_container的尺寸和位置
      this.m_world_container.width = background.width;
      this.m_world_container.height = background.height;
      
      // 居中显示背景图，同时考虑当前窗口大小
      this.m_world_container.x = (this.m_app.screen.width - background.width) / 2;
      this.m_world_container.y = (this.m_app.screen.height - background.height) / 2;

      // 将Sprite位置设置为Container的(0,0)处
      background.anchor.set(0, 0);
      background.x = 0;
      background.y = 0;

      this.m_bg.img_sprite = background;
    };
  }

  //重置路网位置 
  resetBgPos(x?:number, y?:number) {
    let pos_x = x, pos_y = y;
    if (pos_x === undefined) pos_x = 0;
    if (pos_y === undefined) pos_y = 0;
    this.m_world_container.x = pos_x;
    this.m_world_container.y = pos_y;
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 坐标转换 - 与generate_thumbnail函数完全一致
  // 地图背景生成时的转换：x_converted = (x_original - min_x) + padding_x
  // 动态元素也需要进行相同的转换，才能与地图背景匹配
  convertCoordinateX(x:number) {
    const min_x = this.m_bg.rn_min_x;
    const padding_x = this.m_bg.rn_start_x;
    const converted_x = (x - min_x) + padding_x;
    return converted_x;
  }

  convertCoordinateY(y:number) {
    const min_y = this.m_bg.rn_min_y;
    const padding_y = this.m_bg.rn_start_y;
    const converted_y = (y - min_y) + padding_y;
    return converted_y;
  }

  /**
   * @description 更新画布尺寸，处理窗口大小变化
   */
  resizeCanvas(width: number, height: number) {
    if (this.m_app) {
      this.m_width = width;
      this.m_height = height;
      this.m_app.renderer.resize(width, height);
      
      // 保存当前的平移比例，避免重置用户的平移操作
      const currentX = this.m_world_container.x;
      const currentY = this.m_world_container.y;
      
      // 调整world_container的位置，保持居中
      const bgWidth = this.m_bg.img_sprite?.width || width;
      const bgHeight = this.m_bg.img_sprite?.height || height;
      
      // 如果用户没有进行过平移操作（初始状态），则居中显示
      if (currentX === 0 && currentY === 0) {
        this.m_world_container.x = (width - bgWidth) / 2;
        this.m_world_container.y = (height - bgHeight) / 2;
      }
    }
  }

  /**
   * @description 重置缩放和位移，确保元素正确显示
   */
  resetTransform() {
    // 重置缩放
    this.m_app.stage.scale.x = 1;
    this.m_app.stage.scale.y = 1;
    
    // 重置位移
    this.m_world_container.x = 0;
    this.m_world_container.y = 0;
  }

  //设置点击车辆时的回调函数
  setClickDownVehCallBack(cb:VehClickCb) {
    this.m_clickdown_veh_cb = cb;
  }

  setClickUpVehCallBack(cb:VehClickCb) {
    this.m_clickup_veh_cb = cb;
  }

  addVeh(id:number, in_cross?:boolean, cl_id?:number, lane_id?:number, cell_id?:number, x?:number, y?:number, speed?:number, router?:number[]) {
    // 基于车辆ID确定颜色，确保同一辆车始终使用相同颜色
    // 使用ID的哈希值对3取模，分配固定颜色
    const colorIndex = id % 3;
    let car_color = 'car_red';
    switch (colorIndex) {
      case 0:
        car_color = 'car_red';
        break;
      case 1:
        car_color = 'car_green';
        break;
      case 2:
        car_color = 'car_gray';
        break;
    }
    const new_car_sprite = new PIXI.Sprite(PIXI.Assets.get(car_color));
    new_car_sprite.anchor.set(0.5, 0.5);// 将锚点放在中心
    if (x !== undefined) new_car_sprite.x = this.convertCoordinateX(x);
    if (y !== undefined) new_car_sprite.y = this.convertCoordinateY(y);
    new_car_sprite.scale.x = this.m_veh_scale;
    new_car_sprite.scale.y = this.m_veh_scale;

    new_car_sprite.eventMode = 'static';//Opt-in to interactivity 响应鼠标事件
    new_car_sprite.cursor = 'pointer';

    let new_veh:any = null;
    if (in_cross) 
      new_veh = new VehPIXI(new_car_sprite, id, in_cross, cl_id, lane_id, cell_id, -1, -1, -1, x, y, speed, 0, router);
    else 
      new_veh = new VehPIXI(new_car_sprite, id, in_cross, -1, -1, -1, cl_id, lane_id, cell_id, x, y, speed, 0, router);
    if (x !== undefined) new_veh.setLastX(x);
    if (y !== undefined) new_veh.setLastY(y);

    new_car_sprite.on('pointerdown', (event:PIXI.FederatedPointerEvent) => {
      this.m_cur_click_target = new_car_sprite;
      this.m_veh_dragging = true;

      new_car_sprite.scale.set(this.m_veh_scale + 0.4); //放大突出显示
      new_car_sprite.alpha = 0.8;

      this.m_mouse_down_point = event.getLocalPosition(new_car_sprite.parent);

      //调用回调
      if (this.m_clickdown_veh_cb !== undefined) this.m_clickdown_veh_cb(new_veh);
    });
    
    this.m_vehs.push(new_veh);//添加到成员变量
    
    this.m_world_container.addChild(new_car_sprite);//添加到容器
  }

  //new_x, new_y是要相对xml中的坐标
  moveVeh(id:number, new_x:number, new_y:number, rotate:boolean = true) {
    const target_veh_class = this.m_vehs.find(item => item.getId() == id);
    if (target_veh_class) {
      const x_ = this.convertCoordinateX(new_x);
      const y_ = this.convertCoordinateY(new_y);

      //更新坐标
      const old_x = target_veh_class.getX() as number, old_y = target_veh_class.getY() as number;
      target_veh_class.setLastX(old_x);
      target_veh_class.setLastY(old_y);
      target_veh_class.setX(new_x);
      target_veh_class.setY(new_y);

      const veh_sprite = target_veh_class.getVehSprite() as PIXI.Sprite;
      veh_sprite.x = x_;
      veh_sprite.y = y_;
      //旋转车辆
      if (rotate) { //车辆默认是水平向右的
        const x_diff = target_veh_class.getX() as number - target_veh_class.getLastX();
        const y_diff = target_veh_class.getY() as number - target_veh_class.getLastY();
        if (y_diff == 0) {
          if (x_diff > 0) { //说明车辆在向右走
            veh_sprite.rotation = 0;
          }
          else {
            //veh_sprite.rotation = 0;//重置角度
            veh_sprite.rotation = Math.PI;
          }
            
        } else if (x_diff == 0) {
          if (y_diff > 0) { //说明车辆在向下走
            //veh_sprite.rotation = 0;
            veh_sprite.rotation = Math.PI/2;
          }
          else {
            //veh_sprite.rotation = 0;
            veh_sprite.rotation = -Math.PI/2;
          }
        } else {
          const angle = Math.atan2(y_diff, x_diff); //直接计算弧度
          veh_sprite.rotation = angle;
        }
      }
    }
  }

  //rotation的单位是弧度. https://www.mathsisfun.com/geometry/radians.html
  //1弧度 = 180/𝜋度, 1度 = 𝜋/180弧度
  rotateVeh(id:number, rotation:number) {
    const target_veh_class = this.m_vehs.find(item => item.getId() == id);
    if (target_veh_class) {
      const veh_sprite = target_veh_class.getVehSprite() as PIXI.Sprite;
      veh_sprite.rotation = rotation;
    }
  }

  delVeh(id:number) {
    const target_veh_class = this.m_vehs.find(item => item.getId() == id);
    if (target_veh_class) {
      const veh_sprite = target_veh_class.getVehSprite() as PIXI.Sprite;
      this.m_world_container.removeChild(veh_sprite);
      this.m_vehs =  this.m_vehs.filter(veh => (veh.getId() != id));// 移除车辆类 不需要显示调用delete gpt说ts有自动内存回收机制
    }
  }

  updateVehAttr(id: number, attr: string, new_value: any): boolean {
    const allowed_params = ['Id', 'InCross', 'CrossId', 'CrossLaneId', 'CrossCellId', 'LinkId', 'LaneId', 'CellId', 'X', 'Y', 'CurSpd', 'LastSpd', 'Router'];
    if (!allowed_params.includes(attr)) return false;
    
    const setter_methods: { [key: string]: (veh: Veh, value: any) => void } = {
      'Id': (veh: Veh, value: any) => veh.setId(value),
      'InCross': (veh: Veh, value: any) => veh.setInCross(value),
      'CrossId': (veh: Veh, value: any) => veh.setCrossId(value),
      'CrossLaneId': (veh: Veh, value: any) => veh.setCrossLaneId(value),
      'CrossCellId': (veh: Veh, value: any) => veh.setCrossCellId(value),
      'LinkId': (veh: Veh, value: any) => veh.setLinkId(value),
      'LaneId': (veh: Veh, value: any) => veh.setLaneId(value),
      'CellId': (veh: Veh, value: any) => veh.setCellId(value),
      'X': (veh: Veh, value: any) => veh.setX(value),
      'Y': (veh: Veh, value: any) => veh.setY(value),
      'CurSpd': (veh: Veh, value: any) => veh.setCurSpd(value),
      'LastSpd': (veh: Veh, value: any) => veh.setLastSpd(value),
      'Router': (veh: Veh, value: any) => veh.setRouter(value),
    };
  
    const target_veh_class = this.m_vehs.find(item => item.getId() == id);
    if (target_veh_class && setter_methods[attr]) {
      setter_methods[attr](target_veh_class, new_value);
      return true;
    }
  
    return false;
  }

  getCross(id:number) { 
    return this.m_crosses.find(cross => (cross.getId() == id));
  }

  addCross(id:number) {
    const new_cross = new Cross(id);
    this.m_crosses.push(new_cross);
  }

  //设置点击Phase时的回调函数
  setClickPhaseCallBack(cb:PhaseClickCb) {
    this.m_click_phase_cb = cb;
  }

  addPhaseToCross(cross_id:number, phase_id:number, color:string, x:number, y:number) {
    const target_cross = this.m_crosses.find(cross => (cross.getId() == cross_id));
    if (target_cross) {
      const phase_graphics = new PIXI.Graphics();
      let color_hex = 0xFF0000;
      if (color == 'R') 
        color_hex = 0xFF0000;
      else if (color = 'G')
        color_hex = 0x00FF00;
      const x_ = this.convertCoordinateX(x), y_ = this.convertCoordinateY(y);
      phase_graphics.beginFill(color_hex);
      phase_graphics.drawCircle(x_, y_, 5);
      phase_graphics.endFill();

      const phase_pixi = new PhasePIXI(phase_graphics, phase_id, color, x, y);
      target_cross.addPhase(phase_pixi);

      phase_graphics.eventMode = 'static';//Opt-in to interactivity 响应鼠标事件
      phase_graphics.interactive = true;
      phase_graphics.on('pointerdown', (event:PIXI.FederatedPointerEvent) => {
        this.m_cur_click_target = phase_graphics;
  
        //调用回调
        if (this.m_click_phase_cb !== undefined) this.m_click_phase_cb(phase_pixi);
      });

      this.m_world_container.addChild(phase_graphics);//添加到画布上
    }
  }

  updatePhaseColor(cross_id:number, phase_id:number, new_color:string) {
    const target_cross = this.m_crosses.find(cross => (cross.getId() == cross_id));
    if (target_cross) { 
      const phase_pixi = target_cross.getPhaseById(phase_id);
      if (phase_pixi?.getColor() != new_color) {
        const phase_graphics = phase_pixi?.getPhaseGraphics();
        if (phase_graphics) {
          phase_graphics.clear();
          const xml_x = phase_pixi?.getX() as number, xml_y = phase_pixi?.getY() as number;
          const x_ = this.convertCoordinateX(xml_x), y_ = this.convertCoordinateY(xml_y);
          let color_hex = 0xFF0000;
          if (new_color == 'R') 
            color_hex = 0xFF0000;
          else if (new_color === 'G')
            color_hex = 0x00FF00;
          else if (new_color === 'Y')
            color_hex = 0xFFFF00;
          phase_graphics.beginFill(color_hex);
          phase_graphics.drawCircle(x_, y_, 5);
          phase_graphics.endFill();
        }
      }
    }
  }

  /**
   * @description 清除画布上的所有动态元素（车辆和信号灯相位）
   */
  clearCanvas() {
    // 清除所有车辆
    for (const veh of this.m_vehs) {
      const sprite = veh.getVehSprite();
      if (sprite) {
        this.m_world_container.removeChild(sprite);
      }
    }
    this.m_vehs = [];

    // 清除所有相位
    for (const cross of this.m_crosses) {
      const phases = cross.getPhases();
      for (const phase of phases) {
        if (phase instanceof PhasePIXI) {
          const graphics = phase.getPhaseGraphics();
          if (graphics) {
            this.m_world_container.removeChild(graphics);
          }
        }
      }
    }
    this.m_crosses = [];
  }

  /**
   * @description 获取指定ID的车辆
   * @param id 车辆ID
   */
  getVeh(id: number) {
    return this.m_vehs.find(veh => veh.getId() === id);
  }

};