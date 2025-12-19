<template>
  <el-row justify="space-around">
    <el-col :span="3">
      <el-row><!--这里是仿真步数-->
        <el-col :span="24">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="当前步数" label-align="center" align="center" label-class-name="step-label"
              class-name="step-content">{{ cur_step_num }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      <el-row style="margin-top: 10px;"><!--这里是公共属性-->
        <el-col :span="24">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="类型" label-align="center" align="center" label-class-name="type-label"
              class-name="type-content">{{ click_object_type }}</el-descriptions-item>
            <el-descriptions-item label="LinkID" label-align="center" align="center">{{ cur_obj_attr.link_id
              }}</el-descriptions-item>
            <el-descriptions-item label="CrossID" label-align="center" align="center">{{ cur_obj_attr.cross_id
              }}</el-descriptions-item>
            <el-descriptions-item label="LaneID" label-align="center" align="center">{{ cur_obj_attr.lane_id
              }}</el-descriptions-item>
            <el-descriptions-item label="CellID" label-align="center" align="center">{{ cur_obj_attr.cell_id
              }}</el-descriptions-item>
            <el-descriptions-item label="坐标X" label-align="center" align="center">{{ cur_obj_attr.x
              }}</el-descriptions-item>
            <el-descriptions-item label="坐标Y" label-align="center" align="center">{{ cur_obj_attr.y
              }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
      <el-row style="margin-top: 10px;"><!--这里是额外属性操作-->
        <el-col :span="24">
          <el-descriptions v-if="click_object_type=='veh'" :column="1" border>
            <el-descriptions-item label="车辆ID">{{ cur_obj_attr.id }}</el-descriptions-item>
            <el-descriptions-item label="车速">{{ cur_obj_attr.cur_spd }}</el-descriptions-item>
            <el-descriptions-item label="加速度">{{ cur_obj_attr.cur_spd - cur_obj_attr.last_spd }}</el-descriptions-item>
            <el-descriptions-item label="路径Router">{{ cur_obj_attr.router }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-if="click_object_type=='origin'" :column="1" border>
            <el-descriptions-item label="源点ID">{{ cur_obj_attr.id }}</el-descriptions-item>
            <el-descriptions-item label="Plugin?">否</el-descriptions-item>
            <el-descriptions-item label="Policy">{{ cur_obj_attr.policy }}</el-descriptions-item>
            <el-descriptions-item label="Extra">{{ cur_obj_attr.extra }}</el-descriptions-item>
          </el-descriptions>
          <el-descriptions v-if="click_object_type=='signal'" :column="1" border>
            <el-descriptions-item label="周期时间">{{ cur_obj_attr.cycle_time }}</el-descriptions-item>
            <el-descriptions-item label="当前颜色">{{ cur_obj_attr.color }}</el-descriptions-item>
            <el-descriptions-item label="直行绿灯(东西)">{{ cur_obj_attr.ew_straight }}</el-descriptions-item>
            <el-descriptions-item label="左转绿灯(东西)">{{ cur_obj_attr.ew_left }}</el-descriptions-item>
            <el-descriptions-item label="直行绿灯(南北)">{{ cur_obj_attr.sn_straight }}</el-descriptions-item>
            <el-descriptions-item label="左转绿灯(南北)">{{ cur_obj_attr.sn_left }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="14"><!--此处为仿真画布-->
      <canvas id="sim_pixi" width="1000" height="850"> </canvas>
      <div v-if="false" style="padding: 20px; border: 2px solid black;">
        <el-row gutter={20}> <!--假的 只能用于显示 应该放到canvas里-->
          <el-col v-for="(image, index) in drag2new_imgs" :key="index" :span="4">
            <div style="display: flex; justify-content: center; align-items: center; border: 1px solid black; padding: 10px; background-color: #f0f0f0;">
              <img :src="image" alt="image" style="max-width: 100%; height: auto; display: block;" />
            </div>
          </el-col>
        </el-row>
      </div>
    </el-col>
    <el-col :span="6">
      <div>
        <!--此div为日志区域-->
        <el-table :data="tableData" style="width: 100%; min-height: 380px; overflow: auto;" max-height="450">
          <el-table-column fixed prop="date" label="时间" min-width="60" />
          <el-table-column prop="event" label="事件" min-width="120" />
          <el-table-column fixed="right" label="操作" minwidth="30">
            <template #default="scope">
              <el-button link type="primary" size="small" @click.prevent="deleteRow(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div>
        <!--此div为设置区域(控制面板)-->
        <el-card style="width: 100%" shadow="hover">
          <el-row justify="space-between">
            <el-col :span="6">
              <el-button type="primary" @click="OnClickStart">开始仿真</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="info" @click="OnClickPause">暂停仿真</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="danger" @click="OnClickStop">停止仿真</el-button>
            </el-col>
          </el-row>
          <el-row justify="space-between" style="margin-top: 5px">
            <el-col :span="6">
              <el-button color="#626aef" @click="OnClickChangeBgDisplay('road')">道路标号</el-button>
            </el-col>
            <el-col :span="6">
              <el-button color="#626aef" @click="OnClickChangeBgDisplay('cross')">路口标号</el-button>
            </el-col>
            <el-col :span="6">
              <el-button color="#626aef" @click="OnClickChangeBgDisplay('all')">全部显示</el-button>
            </el-col>
            <el-col :span="6">
              <el-button color="#626aef" @click="OnClickChangeBgDisplay('close')">关闭显示</el-button>
            </el-col>
          </el-row>
          <el-row :gutter="3" style="margin-top: 10px">
            <el-col :span="4" style="margin-top: 3px">
              <el-tooltip effect="dark" content="最大仿真步数" placement="bottom-start">
                <el-text class="mx-1" size="large" style="border: 1px solid var(--el-border-color)"
                  type="primary">Step:</el-text>
              </el-tooltip>
            </el-col>
            <el-col :span="16">
              <el-input v-model="input_max_step" placeholder="自动停止最大步数(0为不停止)" />
            </el-col>
            <el-col :span="2">
              <el-button type="primary" :icon="Check" @click="OnClickSetMaxStep(Number(input_max_step))" />
            </el-col>
          </el-row>
          <el-row style="margin-top: 10px">
            <el-col :span="6" style="margin-top: 3px">
              <el-tooltip effect="dark" content="仿真的最小单位" placement="bottom-start">
                <el-text class="mx-1" size="large" style="border: 1px solid var(--el-border-color)"
                  type="primary">粒度:</el-text>
              </el-tooltip>
            </el-col>
            <el-col :span="17">
              <el-radio-group v-model="precision_radio" size="small" style="margin-top: 4px;"
                @change="OnClickChangeSimPrecision">
                <el-radio label="step" border>一个仿真步</el-radio>
                <el-radio label="ope" border>一个内操作</el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row justify="space-between" style="margin-top: 10px">
            <el-col :span="6" style="margin-top: 3px">
              <el-tooltip effect="dark" content="仿真一步(操作)的间隔时间" placement="bottom-start">
                <el-text class="mx-1" size="large" style="border: 1px solid var(--el-border-color)"
                  type="primary">延迟(ms):</el-text>
              </el-tooltip>
            </el-col>
            <el-col :span="17">
              <el-slider v-model="each_step_delay" :min="0" :max="1000" @change="OnSliderChangeDelay" />
            </el-col>
          </el-row>
          <el-row justify="space-between" style="margin-top: 5px">
            <el-col :span="6"><el-button color="#626aef" @click="sim_pixi.resetBgPos()">重置路网位置</el-button></el-col>
            <el-col :span="7">
              <el-drawer v-model="open_plugin_drawer" title="修改插件代码" direction="rtl"
                :before-close="handlePluginDrawerClose">
                <el-tabs type="border-card" v-model="cur_plugin_code_tab" @tab-click="handleClickPluginTab">
                  <el-tab-pane v-for="(tab, index) in plugin_code_tabs" :key="tab.id" :label="tab.label" :name="tab.id">
                    <div><el-input v-model="plugin_code" style="width: 470px" :rows="20" type="textarea"
                        placeholder="输入插件代码" /></div>
                    <div style="margin-top: 10px"><el-button type="danger" plain
                        @click="handleChangePluginCode(tab.id, plugin_code)">应用修改代码</el-button></div>
                  </el-tab-pane>
                </el-tabs>
              </el-drawer>
              <el-button color="#626aef" @click="open_plugin_drawer=true">打开插件面板</el-button>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
//import { io } from 'socket.io-client'; //使用WebSocket进行实时通信
import { Check } from "@element-plus/icons-vue";
import { ElNotification, type TabsPaneContext } from 'element-plus'
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from 'vue-router';
import { GetAuthIdOnce, DelAuthIdOnce, GetMapJson, GetPluginInfo } from '@/apis/SimPIApi'
import { CreateSimEng, GetPluginCode } from '@/apis/SimEngApi'
import { TimeUtils } from "../mods/Utils";
import { SimPIXI, Veh, Phase } from "@/mods/SimPIXI"
// @ts-ignore
import { generate_thumbnail, get_roadnetwork_xy } from '@/views/SimSteps/js/sim'
import router from "@/router";

const sim_pixi_x = 1000, sim_pixi_y = 650;
let sim_pixi = new SimPIXI(sim_pixi_x, sim_pixi_y); //仿真画布 使用PIXI
let bg_pics = {none:'', withRoadNume:'', withCrossNume:'', withAll:''};

const sim_info = JSON.parse(sessionStorage.getItem('sim_info') as string);
const control_views = JSON.parse(sessionStorage.getItem('control_views') as string);

let loading_instance:any = null;

const input_max_step = ref("");
const each_step_delay = ref(0);
const precision_radio = ref('ope');

const open_plugin_drawer = ref(false);
const cur_plugin_code_tab = ref(1);
const plugin_code = ref("");
const plugin_code_tabs = ref([ { label: '跟驰插件', name:"test", id: 1}]);
const cur_step_num = ref(1);
const click_object_type = ref('veh');
const cur_obj_attr = ref({
  id: -1,
  cur_spd: 0,
  last_spd: 0,
  link_id: 0,
  cross_id: 0,
  lane_id: 0,
  cell_id: 0,
  router: "",
  policy: "None",
  extra: 0,
  cycle_time: 0,
  ew_left: 0,
  ew_straight: 0,
  sn_left: 0,
  sn_straight: 0,
  color: 'None',
  x: 0.0,
  y: 0.0
});

const drag2new_imgs = ref(['/sim_imgs/car01.png', '/sim_imgs/car02.png', '/sim_imgs/car03.png', '/sim_imgs/zhangai_40x20.png']); //用于展示'拖拽新建'的物体 [假的 未完成]

const tableData = ref([{date: '现在', event: '初始化完毕'}]);

const deleteRow = (index: number) => {
  tableData.value.splice(index, 1);
};

const handleClickPluginTab = (pane: TabsPaneContext, ev: Event):void => {
  let cur_info = null;
  for (let info of plugin_code_tabs.value) {
    if (info.id == pane.paneName) {
      cur_info = info;
      break;
    }    
  }
  if (cur_info !== null) {
    const plugin_name = cur_info.name;
    GetPluginCode(plugin_name).then((code_text) => {
      plugin_code.value = code_text;
    });
  }
}

const handlePluginDrawerClose = (done: () => void) => {
  ElMessageBox.confirm('确定要关闭插件代码修改窗口吗?请注意应用代码')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

function handleChangePluginCode(tab_id:number, new_code:string) {
  console.log(new_code);//TODO: 发送修改代码逻辑
}

function AddLogPanelMsg(msg:string, time:string = "") {
  let time_str = time;
  if (!time || time.trim().length === 0) {
    time_str = TimeUtils.timestampToString(TimeUtils.getTimestamp(), "HH:mm:ss");
  }
  const event_obj = {date: time_str, event: msg};
  tableData.value.unshift(event_obj);
}

function OnClickChangeSimPrecision(value:string) {
  console.log("sim pre:" + value);
}

function OnClickChangeBgDisplay(value:string) {
  let bg_pic = '';
  if (value == "road") {
    bg_pic = bg_pics.withRoadNume;
  } else if (value == "cross") {
    bg_pic = bg_pics.withCrossNume;
  } else if (value == "all") {
    bg_pic = bg_pics.withAll;
  } else if (value == "close") {
    bg_pic = bg_pics.none;
  }
  sim_pixi.setRoadNetworkBg(bg_pic);
}

//值改变时触发(使用鼠标拖曳时，只在松开鼠标后触发)
function OnSliderChangeDelay(value: number | number[]): boolean {
  let delay_msg = {type: "eng", ope:"setdelay", time: 0, data:{Delay:0}};
  let timestamp = Date.now();
  delay_msg.time = timestamp;
  delay_msg.data.Delay = value as number;
  ws.send(JSON.stringify(delay_msg));
  return true;
}

// 使用标准 WebSocket API DEV环境为localhost 生产环境为ip
const ws = new WebSocket("ws://127.0.0.1:3822/ws/frontend");

// 监听连接建立
ws.onopen = () => {
  console.log("WebSocket connected");
  let hello_msg = {type: "backend", ope:"hello", time: 0};
  let timestamp = Date.now();
  hello_msg.time = timestamp;
  ws.send(JSON.stringify(hello_msg));
};

// 监听消息接收
ws.onmessage = (event) => {
  //console.log("Message from server:", event.data);
  let msg_obj = JSON.parse(event.data);
  if (msg_obj.type == 'frontend') { //只处理发给前端的消息
    const time_str = TimeUtils.timestampToString(msg_obj.time, "HH:mm:ss");
    if (msg_obj.ope == 'hi') {  
      AddLogPanelMsg("连接管理服务完成", time_str);
    } else if (msg_obj.ope == 'eng_ok') {
      AddLogPanelMsg("连接仿真引擎完成", time_str);
      loading_instance.close(); //关闭加载蒙版

      //设置插件应用
      for (let cv of control_views){
        if (cv.use_plugin) {
          const p_type = cv.control_type;
          const p_name = cv.active_plugin;
          let set_plugin_msg = {type: "eng", ope:"setmainplugin", time: 0, data:{ConType:"", Name:""}};
          let timestamp = Date.now();
          set_plugin_msg.time = timestamp;
          set_plugin_msg.data.ConType = p_type;
          set_plugin_msg.data.Name = p_name;
          ws.send(JSON.stringify(set_plugin_msg));
        }
      }

    } else if (msg_obj.ope == "handleope") {
      let msg_data = msg_obj.data;
      let msg_data_result = msg_data.result;
      if (typeof msg_data_result === "string") {
        if (msg_data_result == "start_ok")
          AddLogPanelMsg("开始/恢复仿真", time_str);
        else if (msg_data_result == "pause_ok")
          AddLogPanelMsg("暂停仿真", time_str);
        else if (msg_data_result == "exit_ok")
          AddLogPanelMsg("结束/退出仿真", time_str);
        else if (msg_data_result == "setmaxstep_ok")
          AddLogPanelMsg("更新最大仿真步数完成", time_str);
        else if (msg_data_result == "setmainplugin_ok")
          AddLogPanelMsg("激活插件完成", time_str);
        else if (msg_data_result == "setdelay_ok")
          AddLogPanelMsg("更新仿真延迟完成", time_str);
      } else if (typeof msg_data_result === "object" && msg_data_result != null) {
        ;//暂无
      }
    } else if (msg_obj.ope == "simdata") {
      //处理仿真数据
      const msg_obj_data = msg_obj.data;
      if (msg_obj_data.pos == 'produce_veh') {
        //TODO: 产生的车辆不一定在link中也有可能在cross中, 这里不写了, 有空再改(前后端引擎都要改)
        const msg_obj_data_result = msg_obj_data.result;
        for (let one_result of msg_obj_data_result) {
          const veh_id:number = one_result.id;
          const veh_link_id:number = one_result.link_id;
          const veh_lane_id:number = one_result.lane_id;
          const veh_cell_id:number = one_result.cell_id;
          const veh_x:number = one_result.x;
          const veh_y:number = one_result.y;
          const veh_spd:number = one_result.speed;
          const veh_router:number[] = one_result.router.split(' ').map(Number);
          sim_pixi.addVeh(veh_id, false, veh_link_id, veh_lane_id, veh_cell_id, veh_x, veh_y, veh_spd, veh_router);

          //根据LinkID拿到车辆所在的PathID, 通过PathID拿到baseline的坐标, 算出角度
          const map_data = sim_info.map_json;
          const LinkInfo = map_data.Link.find((link:any) => (link.Object_ID == veh_link_id));
          const PathID = LinkInfo.Path_ID;
          const PathInfo = map_data.Baseline.find((path:any) => (path.Path_ID == PathID));
          const coordinates = PathInfo.Points.split(',').filter((coord:any) => coord.trim() !== '').map((coord:any) => coord.split(' ').map(Number));
          if (coordinates.length == 2) {//正常都是两个坐标
            const y_diff = (coordinates[1][1] - coordinates[0][1]);//(y2 - y1)
            const x_diff = (coordinates[1][0] - coordinates[0][0]);//(x2 - x1)
            if (y_diff == 0) {//说明是水平的
              ;//水平的不用管 车辆图片生成的时候就是水平的
            } else if (x_diff == 0) {//说明是垂直的
              //90度 = (𝜋/180)*90弧度 = 𝜋/2
              sim_pixi.rotateVeh(veh_id, Math.PI/2);
            } else {
              //角度 = tan^(-1)(斜率) = (𝜋/180)*(tan^(-1)(斜率)) 弧度
              const angle = Math.atan2(y_diff, x_diff); //直接计算弧度
              sim_pixi.rotateVeh(veh_id, angle);
            }
          }
        }
      } else if (msg_obj_data.pos == 'veh_run') {
        const msg_obj_data_result = msg_obj_data.result;
        const veh_id: number = msg_obj_data_result.id;
        const veh_in_network: boolean = msg_obj_data_result.in_network;
        if (veh_in_network) {
          const veh_in_cross: boolean = msg_obj_data_result.in_cross;
          const veh_cl_id: number = veh_in_cross ? msg_obj_data_result.cross_id : msg_obj_data_result.link_id;
          const veh_lane_id: number = msg_obj_data_result.lane_id;
          const veh_cell_id: number = msg_obj_data_result.cell_id;
          const veh_x: number = msg_obj_data_result.x;
          const veh_y: number = msg_obj_data_result.y;
          const cur_spd: number = msg_obj_data_result.cur_spd;
          const last_spd: number = msg_obj_data_result.last_spd;
          sim_pixi.updateVehAttr(veh_id, 'InCross', veh_in_cross);
          if (veh_in_cross) {
            sim_pixi.updateVehAttr(veh_id, 'CrossId', veh_cl_id);
            sim_pixi.updateVehAttr(veh_id, 'CrossLaneId', veh_lane_id);
            sim_pixi.updateVehAttr(veh_id, 'CrossCellId', veh_cell_id);
            sim_pixi.updateVehAttr(veh_id, 'LinkId', -1);
            sim_pixi.updateVehAttr(veh_id, 'LaneId', -1);
            sim_pixi.updateVehAttr(veh_id, 'CellId', -1);
          } else {
            sim_pixi.updateVehAttr(veh_id, 'LinkId', veh_cl_id);
            sim_pixi.updateVehAttr(veh_id, 'LaneId', veh_lane_id);
            sim_pixi.updateVehAttr(veh_id, 'CellId', veh_cell_id);
            sim_pixi.updateVehAttr(veh_id, 'CrossId', -1);
            sim_pixi.updateVehAttr(veh_id, 'CrossLaneId', -1);
            sim_pixi.updateVehAttr(veh_id, 'CrossCellId', -1);
          }
          //sim_pixi.updateVehAttr(veh_id, 'X', veh_x);
          //sim_pixi.updateVehAttr(veh_id, 'Y', veh_y);
          sim_pixi.updateVehAttr(veh_id, 'CurSpd', cur_spd);
          sim_pixi.updateVehAttr(veh_id, 'LastSpd', last_spd);

          sim_pixi.moveVeh(veh_id, veh_x, veh_y);
        } else {
          sim_pixi.delVeh(veh_id);
        }

      } else if (msg_obj_data.pos == 'controller_run') {
        const msg_obj_data_result = msg_obj_data.result;
        const cross_id = msg_obj_data_result.cross_id;
        if (sim_pixi.getCross(cross_id) === undefined) {
          //不存在这个Cross则创建
          sim_pixi.addCross(cross_id);
          for (let phase of msg_obj_data_result.phases) {
            const phase_id = phase.id;
            const phase_color = phase.color;
            const phase_x = phase.x, phase_y = phase.y;
            sim_pixi.addPhaseToCross(cross_id, phase_id, phase_color, phase_x, phase_y);
          }
        } else {
          //存在则更新颜色
          for (let phase of msg_obj_data_result.phases) {
            const phase_id = phase.id;
            const phase_color = phase.color;
            sim_pixi.updatePhaseColor(cross_id, phase_id, phase_color);
          }
        }

      } else if (msg_obj_data.pos == 'sim_one_step') {
        const next_step = msg_obj_data.next_step + 1;
        cur_step_num.value = next_step;
      }
      
    }
  } else {
    AddLogPanelMsg("接收到未知消息")
  }
};

// 监听连接关闭
ws.onclose = () => {
  console.log("WebSocket connection closed");
};

// 监听错误
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

function OnClickStart() {
  if (each_step_delay.value == 0) {
    ElMessage.warning("注意! 仿真延迟为0");
  }

  let start_msg = { type:"eng", ope:"start", time:0};
  let timestamp = Date.now();
  start_msg.time = timestamp;
  ws.send(JSON.stringify(start_msg));
}

function OnClickPause() {
  let pause_msg = { type:"eng", ope:"pause", time:0};
  let timestamp = Date.now();
  pause_msg.time = timestamp;
  ws.send(JSON.stringify(pause_msg));
}

function OnClickStop() {
  let stop_msg = { type:"eng", ope:"stop", time:0};
  let timestamp = Date.now();
  stop_msg.time = timestamp;
  ws.send(JSON.stringify(stop_msg));
}

function OnClickSetMaxStep(step_num:number) {
  let setmaxstep_msg = { type:"eng", ope:"setmaxstep", time:0, data:{Step:0}};
  let timestamp = Date.now();
  setmaxstep_msg.time = timestamp;
  setmaxstep_msg.data.Step = step_num;
  ws.send(JSON.stringify(setmaxstep_msg));
}

onMounted(() => {
  loading_instance = ElLoading.service({
    fullscreen: true,
    lock: true,
    text: "正在连接管理/引擎服务...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  //创建仿真画布 并设置背景图
  if (sim_pixi.appendSimPIXI("sim_pixi")) {
    //重新绘制不同的图片(带不带标号)
    const map_data = sim_info.map_json;
    const lane_num = map_data['Link'][0]['Lane_Number'];
    let bg_url = generate_thumbnail(map_data, lane_num, false, false);
    bg_pics.none = bg_url;
    bg_pics.withRoadNume = generate_thumbnail(map_data, lane_num, true, false);
    bg_pics.withCrossNume = generate_thumbnail(map_data, lane_num, false, true);
    bg_pics.withAll = generate_thumbnail(map_data, lane_num, true, true);

    let min_x = 0, min_y = 0, start_x = 0, start_y = 0, max_x = 0, max_y = 0;
    const min_xy = get_roadnetwork_xy(map_data, 'min');
    min_x = min_xy.x;
    min_y = min_xy.y;
    const max_xy = get_roadnetwork_xy(map_data, 'max');
    max_x = max_xy.x;
    max_y = max_xy.y;
    const start_xy = get_roadnetwork_xy(map_data, 'start');
    start_x = start_xy.x;
    start_y = start_xy.y;
    sim_pixi.setRoadNetworkBg(bg_url, min_x, min_y, max_x, max_y, start_x, start_y);
  } else {
    AddLogPanelMsg("仿真画布加载失败!");
    ElMessage({
        message: 'SimPIXI画布加载失败!',
        type: 'error',
        duration: 5000,
        showClose: true
    });
  }
  AddLogPanelMsg("仿真画布加载完成");

  sim_pixi.setClickDownVehCallBack((veh:Veh) => {
    OnClickPause();//先暂停仿真

    click_object_type.value = 'veh';

    cur_obj_attr.value.id = veh.getId() as number;
    if (veh.getInCross()) {
      cur_obj_attr.value.cross_id = veh.getCrossId() as number;
      cur_obj_attr.value.link_id = -1;
      cur_obj_attr.value.lane_id = veh.getCrossLaneId() as number;
      cur_obj_attr.value.cell_id = veh.getCrossCellId() as  number;
    } else {
      cur_obj_attr.value.link_id = veh.getLinkId() as number;
      cur_obj_attr.value.cross_id = -1;
      cur_obj_attr.value.lane_id = veh.getLaneId() as number;
      cur_obj_attr.value.cell_id = veh.getCellId() as number;
    }
    cur_obj_attr.value.cur_spd = veh.getCurSpd() as number;
    cur_obj_attr.value.last_spd = veh.getLastSpd() as number;
    cur_obj_attr.value.x = veh.getX() as number;
    cur_obj_attr.value.y = veh.getY() as number;
    cur_obj_attr.value.router = veh.getRouter()?.join(" ") as string;
  });

  sim_pixi.setClickPhaseCallBack((phase:Phase) => {
    click_object_type.value = 'signal';

    cur_obj_attr.value.id = phase.getId() as number;
    cur_obj_attr.value.color = phase.getColor() as string;
    cur_obj_attr.value.x = phase.getX() as number;
    cur_obj_attr.value.y = phase.getY() as number;
  });
  
  //仿真和插件信息
  console.log(sim_info)
  console.log(control_views)

  const plugin_code_tab_names: any = [];
  let id = 1;
  for (let control of control_views) {
    if (control.use_plugin) {
      const tab_id = id;
      plugin_code_tab_names.push({ label: control.control_type + ' ' + control.active_plugin, name: control.active_plugin, id: tab_id });
      id += 1;
    }
  }
  plugin_code_tabs.value = plugin_code_tab_names;
  if (plugin_code_tab_names.length > 0) cur_plugin_code_tab.value = plugin_code_tab_names[0].id;
  
  CreateSimEng(sim_info, control_views).then(rep => {
    //console.log(rep);
    AddLogPanelMsg("请求创建仿真引擎完成");
  });

});

// 在组件卸载时断开连接
onUnmounted(() => {
  OnClickStop();//触发一次关闭引擎的操作
  ws.close();
});

// 拦截路由变化
onBeforeRouteLeave((to, from, next) => {
  const answer = window.confirm('将终止此次仿真, 确定要离开吗？');
  if (answer) {
    // 用户点击 "是"，发送请求
    DelAuthIdOnce();
    let stop_msg = { type:"eng", ope:"stop", time:0};
    let timestamp = Date.now();
    stop_msg.time = timestamp;
    ws.send(JSON.stringify(stop_msg));
    ws.close();
    next();  // 允许导航
  } else {
    next(false);  // 阻止导航
  }
});
</script>

<style scoped>
:deep(.type-label) {
  background: var(--el-color-success-light-9) !important;
}
:deep(.type-content) {
  background: var(--el-color-danger-light-9);
}

:deep(.step-label) {
  background: var(--el-color-danger-light-9)!important;
}
:deep(.step-content) {
  background: #b0d5df;
}
</style>
