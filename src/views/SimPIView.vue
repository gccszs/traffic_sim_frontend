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
      <div style="height: 450px; overflow-y: auto; padding: 8px;">
        <!-- 行为模型参数在线调整控制台 -->
        <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #409eff;">
          行为模型参数调整
        </div>

        <!-- PA-EIDM 跟驰模型参数 -->
        <el-collapse v-model="paramPanelActive" accordion>
          <el-collapse-item title="跟驰模型 (PA-EIDM) 固定参数" name="cf_fixed">
            <div class="param-row">
              <span class="param-label">舒适减速度 b (m/s²)</span>
              <el-slider v-model="cfParams.b" :min="0.5" :max="4.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.b" :min="0.5" :max="4.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">最小安全间距 s₀ (m)</span>
              <el-slider v-model="cfParams.s0" :min="0.5" :max="5.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.s0" :min="0.5" :max="5.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">加速度指数 δ</span>
              <el-slider v-model="cfParams.delta" :min="1" :max="8" :step="1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.delta" :min="1" :max="8" :step="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">感知时延 τ (s)</span>
              <el-slider v-model="cfParams.tau" :min="0.0" :max="1.0" :step="0.05" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.tau" :min="0.0" :max="1.0" :step="0.05" :precision="2" size="small" style="width: 100px;" />
            </div>
          </el-collapse-item>

          <el-collapse-item title="跟驰模型 (PA-EIDM) LPN约束边界" name="cf_lpn">
            <div class="param-row">
              <span class="param-label">期望时距下界 T_min (s)</span>
              <el-slider v-model="cfParams.T_min" :min="0.1" :max="2.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.T_min" :min="0.1" :max="2.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">期望时距上界 T_max (s)</span>
              <el-slider v-model="cfParams.T_max" :min="1.0" :max="5.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.T_max" :min="1.0" :max="5.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">期望速度下界 v₀_min (m/s)</span>
              <el-slider v-model="cfParams.v0_min" :min="1.0" :max="15.0" :step="0.5" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.v0_min" :min="1.0" :max="15.0" :step="0.5" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">期望速度上界 v₀_max (m/s)</span>
              <el-slider v-model="cfParams.v0_max" :min="15.0" :max="60.0" :step="0.5" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.v0_max" :min="15.0" :max="60.0" :step="0.5" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">最大加速度下界 a_min (m/s²)</span>
              <el-slider v-model="cfParams.a_min" :min="0.1" :max="2.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.a_min" :min="0.1" :max="2.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">最大加速度上界 a_ub (m/s²)</span>
              <el-slider v-model="cfParams.a_ub" :min="1.0" :max="5.0" :step="0.1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="cfParams.a_ub" :min="1.0" :max="5.0" :step="0.1" :precision="1" size="small" style="width: 100px;" />
            </div>
          </el-collapse-item>

          <el-collapse-item title="换道模型 (STFPM) 参数" name="lc_params">
            <div class="param-row">
              <span class="param-label">安全距离阈值 d_safe (m)</span>
              <el-slider v-model="lcParams.d_safe_th" :min="1.0" :max="20.0" :step="0.5" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="lcParams.d_safe_th" :min="1.0" :max="20.0" :step="0.5" :precision="1" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">死区阈值 δ_th</span>
              <el-slider v-model="lcParams.delta_th" :min="0.01" :max="1.0" :step="0.01" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="lcParams.delta_th" :min="0.01" :max="1.0" :step="0.01" :precision="2" size="small" style="width: 100px;" />
            </div>
            <div class="param-row">
              <span class="param-label">一致性窗口长度 N (帧)</span>
              <el-slider v-model="lcParams.N" :min="1" :max="20" :step="1" :show-tooltip="true" style="flex:1; margin: 0 8px;" />
              <el-input-number v-model="lcParams.N" :min="1" :max="20" :step="1" size="small" style="width: 100px;" />
            </div>
          </el-collapse-item>
        </el-collapse>

        <div style="margin-top: 12px; text-align: center;">
          <el-button type="primary" @click="handleApplyParams" :loading="applyingParams">下发参数</el-button>
          <el-button @click="handleResetParams">重置默认</el-button>
        </div>
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
  <!-- 仿真统计信息模块 -->
  <el-row style="margin-top: 20px;">
    <el-col :span="24">
      <div id="simStatistics" class="statistics-container">
        <!-- 顶部拥堵指数 -->
        <div class="statistics-top">
          <div class="top-title">
            <div class="score">
              <div class="point" style="background: rgb(137,189,27)" />
              <div style="margin-left: 20px">{{ congestionIndex }}</div>
            </div>
            <div style="padding-left: 50px">{{ congestionName }}</div>
          </div>
          <div class="progress-bar">
            <el-progress :show-text="false" :stroke-width="14" status="success" :percentage="congestionIndex * 10" />
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="line" style="background-color: #8C8D91" />
        
        <!-- 中部关键指标 -->
        <div class="statistics-mid">
          <div style="display: flex; flex-direction: row; justify-content: space-around; flex-wrap: wrap; width: 100%">
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(137,189,27)" />
                <div style="margin-left: 20px">{{ queuingTimeData }} <span style="font-size: 12px;">s</span></div>
              </div>
              <div class="stat-text">{{ queuingTime }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(194,85,210)" />
                <div style="margin-left: 20px">{{ trafficInData }} <span style="font-size: 12px;">辆/分钟</span></div>
              </div>
              <div class="stat-text">{{ trafficIn }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(232,104,82)" />
                <div style="margin-left: 20px">{{ queuingLengthData }} <span style="font-size: 12px;">m</span></div>
              </div>
              <div class="stat-text">{{ queuingLength }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(45,216,219)" />
                <div style="margin-left: 20px">{{ trafficOutData }} <span style="font-size: 12px;">辆/分钟</span></div>
              </div>
              <div class="stat-text">{{ trafficOut }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(255,51,100)" />
                <div style="margin-left: 20px">{{ stoppingTimesData }} <span style="font-size: 12px;">次</span></div>
              </div>
              <div class="stat-text">{{ stoppingTimes }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-score">
                <div class="point" style="background: rgb(0,99,93)" />
                <div style="margin-left: 20px">{{ carSpeedData }} <span style="font-size: 12px;">km/h</span></div>
              </div>
              <div class="stat-text">{{ carSpeed }}</div>
            </div>
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="line" style="background-color: #8C8D91" />
        
        <!-- 底部图表 -->
        <div class="statistics-footer">
          <div class="chart-footer">
            <div id="chartVehicleSpeed" class="chart" />
          </div>
        </div>
        <div class="statistics-footer">
          <div class="chart-footer">
            <div id="chartCongestion" class="chart" />
          </div>
        </div>
        
        <!-- 更多统计数据按钮 -->
        <div class="more-button" @click="openMoreStats">更多统计数据>></div>
        
        <!-- 更多统计数据对话框 -->
        <el-dialog 
          id="statsDialog" 
          title="统计数据" 
          v-model="dialogVisible" 
          top="20px" 
          width="1400px" 
          :center="true"
          custom-class="stats-dialog"
        >
          <div class="dialog-content">
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart1" class="dialog-chart" />
            </el-card>
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart2" class="dialog-chart" />
            </el-card>
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart3" class="dialog-chart" />
            </el-card>
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart4" class="dialog-chart" />
            </el-card>
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart5" class="dialog-chart" />
            </el-card>
            <el-card body-style="padding:0" class="dialog-card">
              <div id="dialogChart6" class="dialog-chart" />
            </el-card>
          </div>
        </el-dialog>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
//import { io } from 'socket.io-client'; //使用WebSocket进行实时通信
import { Check } from "@element-plus/icons-vue";
import { ElNotification, type TabsPaneContext } from 'element-plus'
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from 'vue-router';
import { GetAuthIdOnce, DelAuthIdOnce, GetMapJson, GetPluginInfo } from '@/apis/SimPIApi'
import { PrepareSimulation, CreateSimEng, GetPluginCode } from '@/apis/SimEngApi'
import { TimeUtils } from "../mods/Utils";
import { SimPIXI, Veh, Phase } from "@/mods/SimPIXI"
// @ts-ignore
import { generate_thumbnail, get_roadnetwork_xy } from '@/views/SimSteps/js/sim'
import router from "@/router";
// 导入ECharts
import * as echarts from 'echarts';

const sim_pixi_x = 1000, sim_pixi_y = 650;
let sim_pixi = new SimPIXI(sim_pixi_x, sim_pixi_y); //仿真画布 使用PIXI
let bg_pics = {none:'', withRoadNume:'', withCrossNume:'', withAll:''};

const sim_info = JSON.parse(sessionStorage.getItem('sim_info') as string);
const control_views = JSON.parse(sessionStorage.getItem('control_views') as string);

let loading_instance:any = null;

// 添加taskId变量
const taskId = ref("");

const input_max_step = ref("");
const each_step_delay = ref(0);
const precision_radio = ref('ope');

const open_plugin_drawer = ref(false);
const cur_plugin_code_tab = ref(1);
const plugin_code = ref("");
const plugin_code_tabs = ref([ { label: '跟驰插件', name:"test", id: 1}]);

// 行为模型参数在线调整
const paramPanelActive = ref('cf_fixed');
const applyingParams = ref(false);

const defaultCfParams = () => ({
  b: 1.5, s0: 2.0, delta: 4, tau: 0.1,
  T_min: 0.5, T_max: 3.0,
  v0_min: 5.0, v0_max: 40.0,
  a_min: 0.5, a_ub: 3.0,
});
const defaultLcParams = () => ({
  d_safe_th: 5.0, delta_th: 0.1, N: 5,
});

const cfParams = ref(defaultCfParams());
const lcParams = ref(defaultLcParams());

const handleApplyParams = async () => {
  applyingParams.value = true;
  try {
    // 通过 WebSocket 下发参数到仿真引擎
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        type: 'updateParams',
        cfParams: cfParams.value,
        lcParams: lcParams.value,
      });
      ws.value.send(msg);
      ElMessage.success('参数已下发，将在下一仿真步生效');
    } else {
      ElMessage.warning('WebSocket 未连接，无法下发参数');
    }
  } catch (err: any) {
    ElMessage.error('参数下发失败: ' + (err.message || '未知错误'));
  } finally {
    applyingParams.value = false;
  }
};

const handleResetParams = () => {
  cfParams.value = defaultCfParams();
  lcParams.value = defaultLcParams();
  ElMessage.info('参数已重置为默认值');
};
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

// 仿真统计数据 - 匹配目标文件结构
const congestionName = ref('拥堵指数：');
const congestionIndex = ref(0);
const queuingTime = ref('排队时间');
const queuingTimeData = ref(0);
const queuingLength = ref('排队长度');
const queuingLengthData = ref(0);
const trafficIn = ref('驶入车流');
const trafficInData = ref(0);
const trafficOut = ref('驶出车流');
const trafficOutData = ref(0);
const stoppingTimes = ref('停车次数');
const stoppingTimesData = ref(0);
const carSpeed = ref('车辆速度');
const carSpeedData = ref(0);
const dialogVisible = ref(false);

// 图表数据数组
const trafficInArray = ref<[number, number][]>([]);
const trafficOutArray = ref<[number, number][]>([]);
const carSpeedArray = ref<[number, number][]>([]);
const congestionIndexArray = ref<[number, number][]>([]);
const stoppingTimesArray = ref<[number, number][]>([]);
const queuingLengthArray = ref<[number, number][]>([]);
const queuingTimeArray = ref<[number, number][]>([]);

// 辅助数据
const maxStep = ref(0);
const tempIndex = ref(0);
const maxSimulationStep = ref(500); // 默认最大仿真步数

// 图表实例引用
let chartVehicleSpeed: echarts.ECharts | null = null;
let chartCongestion: echarts.ECharts | null = null;
let dialogCharts: echarts.ECharts[] = [];

// 绘制底部图表
function drawFooterCharts() {
  // 初始化车辆速度图表
  const speedChartDom = document.getElementById('chartVehicleSpeed');
  if (speedChartDom) {
    chartVehicleSpeed = echarts.init(speedChartDom);
    chartVehicleSpeed.setOption({
      backgroundColor: '#394056',
      title: {
        top: 10,
        text: '车辆速度(km/h)',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 16,
          color: '#F1F1F3'
        },
        left: '1%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            color: '#57617B'
          }
        },
        formatter: function(params: any) {
          let res = '';
          res += '步数：' + params[0].name;
          for (let i = 0, l = params.length; i < l; i++) {
            res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].data[1];
          }
          return res;
        }
      },
      legend: {
        top: 10,
        icon: 'rect',
        itemWidth: 14,
        itemHeight: 5,
        itemGap: 13,
        data: ['车辆速度'],
        selectedMode: 'single',
        right: '4%',
        textStyle: {
          fontSize: 12,
          color: '#F1F1F3'
        }
      },
      grid: {
        top: 50,
        left: '2%',
        right: '5%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: [{
        type: 'value',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        max: maxSimulationStep.value
      }],
      yAxis: [{
        type: 'value',
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        axisLabel: {
          margin: 10,
          textStyle: {
            fontSize: 14,
            color: '#F1F1F3'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#57617B'
          }
        }
      }],
      series: [{
        name: '车辆速度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          normal: {
            width: 1
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(0, 136, 212, 0.3)'
            }, {
              offset: 0.8,
              color: 'rgba(0, 136, 212, 0)'
            }], false),
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10
          }
        },
        itemStyle: {
          normal: {
            color: 'rgb(0,136,212)',
            borderColor: 'rgba(0,136,212,0.2)',
            borderWidth: 12
          }
        },
        data: carSpeedArray.value
      }]
    });
  }

  // 初始化拥堵指数图表
  const congestionChartDom = document.getElementById('chartCongestion');
  if (congestionChartDom) {
    chartCongestion = echarts.init(congestionChartDom);
    chartCongestion.setOption({
      backgroundColor: '#394056',
      title: {
        top: 10,
        text: '拥堵指数',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 16,
          color: '#F1F1F3'
        },
        left: '1%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            color: '#57617B'
          }
        },
        formatter: function(params: any) {
          let res = '';
          res += '步数：' + params[0].name;
          for (let i = 0, l = params.length; i < l; i++) {
            res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].data[1];
          }
          return res;
        }
      },
      legend: {
        top: 10,
        icon: 'rect',
        itemWidth: 14,
        itemHeight: 5,
        itemGap: 13,
        data: ['拥堵指数'],
        selectedMode: 'single',
        right: '4%',
        textStyle: {
          fontSize: 12,
          color: '#F1F1F3'
        }
      },
      grid: {
        top: 50,
        left: '2%',
        right: '5%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: [{
        type: 'value',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        max: maxSimulationStep.value
      }],
      yAxis: [{
        type: 'value',
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#57617B'
          }
        },
        axisLabel: {
          margin: 10,
          textStyle: {
            fontSize: 14,
            color: '#F1F1F3'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#57617B'
          }
        }
      }],
      series: [{
        name: '拥堵指数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          normal: {
            width: 1
          }
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(137, 189, 27, 0.3)'
            }, {
              offset: 0.8,
              color: 'rgba(137, 189, 27, 0)'
            }], false),
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10
          }
        },
        itemStyle: {
          normal: {
            color: 'rgb(137,189,27)',
            borderColor: 'rgba(137,189,2,0.27)',
            borderWidth: 12
          }
        },
        data: congestionIndexArray.value
      }]
    });
  }
}

// 绘制对话框图表
function drawDialogCharts() {
  // 清空之前的图表实例
  dialogCharts.forEach(chart => chart.dispose());
  dialogCharts = [];

  // 图表配置复用函数
  const getChartOption = (title: string, seriesName: string, data: [number, number][], color: string) => ({
    backgroundColor: '#394056',
    title: {
      top: 20,
      text: title,
      textStyle: {
        fontWeight: 'normal',
        fontSize: 16,
        color: '#F1F1F3'
      },
      left: '1%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#57617B'
        }
      },
      formatter: function(params: any) {
        let res = '';
        res += '步数：' + params[0].name;
        for (let i = 0, l = params.length; i < l; i++) {
          res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + params[i].data[1];
        }
        return res;
      }
    },
    legend: {
      top: 20,
      icon: 'rect',
      itemWidth: 14,
      itemHeight: 5,
      itemGap: 13,
      data: [seriesName],
      selectedMode: 'single',
      right: '4%',
      textStyle: {
        fontSize: 12,
        color: '#F1F1F3'
      }
    },
    grid: {
      top: 100,
      left: '2%',
      right: '5%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: [{
      type: 'value',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#57617B'
        }
      },
      max: maxSimulationStep.value
    }],
    yAxis: [{
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#57617B'
        }
      },
      axisLabel: {
        margin: 10,
        textStyle: {
          fontSize: 14,
          color: '#F1F1F3'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#57617B'
        }
      }
    }],
    series: [{
      name: seriesName,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      lineStyle: {
        normal: {
          width: 1
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: `rgba(${color.split(',').join(', ')}, 0.3)`
          }, {
            offset: 0.8,
            color: `rgba(${color.split(',').join(', ')}, 0)`
          }], false),
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      itemStyle: {
        normal: {
          color: `rgb(${color})`,
          borderColor: `rgba(${color}, 0.2)`,
          borderWidth: 12
        }
      },
      data: data
    }]
  });

  // 车流统计图表
  const chart1 = echarts.init(document.getElementById('dialogChart1'));
  chart1.setOption(getChartOption('车流统计', '驶入车流', trafficInArray.value, '137,189,27'));
  dialogCharts.push(chart1);

  // 车辆参数图表
  const chart2 = echarts.init(document.getElementById('dialogChart2'));
  chart2.setOption(getChartOption('车辆速度', '车辆速度', carSpeedArray.value, '0,136,212'));
  dialogCharts.push(chart2);

  // 排队信息图表
  const chart3 = echarts.init(document.getElementById('dialogChart3'));
  chart3.setOption(getChartOption('排队长度', '排队长度', queuingLengthArray.value, '219,50,51'));
  dialogCharts.push(chart3);

  // 拥堵指数图表
  const chart4 = echarts.init(document.getElementById('dialogChart4'));
  chart4.setOption(getChartOption('拥堵指数', '拥堵指数', congestionIndexArray.value, '137,189,27'));
  dialogCharts.push(chart4);

  // 停车信息图表
  const chart5 = echarts.init(document.getElementById('dialogChart5'));
  chart5.setOption(getChartOption('停车次数', '停车次数', stoppingTimesArray.value, '194,85,210'));
  dialogCharts.push(chart5);

  // 驶出车流图表
  const chart6 = echarts.init(document.getElementById('dialogChart6'));
  chart6.setOption(getChartOption('驶出车流', '驶出车流', trafficOutArray.value, '45,216,219'));
  dialogCharts.push(chart6);
}

// 更新统计数据的函数
function updateStatistics(data: any) {
  console.log('=== 开始处理统计数据 ===');
  console.log('完整infoStat数据:', JSON.stringify(data, null, 2));
  
  maxStep.value++;
  tempIndex.value++;
  
  // 更新实时数据，添加异常值处理
  trafficInData.value = Math.round(data.global?.cars_in || 0);
  trafficOutData.value = Math.round(data.global?.cars_out || 0);
  stoppingTimesData.value = Math.round(data.global?.stop_ave || 0);
  
  // 车辆速度处理
  carSpeedData.value = Math.max(0, Math.floor((data.speed_ave || 0) * 100) / 100);
  
  // 拥堵指数处理：确保在0-1之间
  console.log('=== 处理拥堵指数 ===');
  console.log('data.global:', data.global);
  
  // 检查jam_index可能存在的位置
  let jamIndex = 0;
  let jamIndexSource = '未找到';
  
  // 尝试从不同位置获取jam_index
  if (data.jam_index !== undefined) {
    jamIndex = data.jam_index;
    jamIndexSource = 'data.jam_index';
  } else if (data.global?.jam_index !== undefined) {
    jamIndex = data.global.jam_index;
    jamIndexSource = 'data.global.jam_index';
  } else if (data.infoStat?.jam_index !== undefined) {
    jamIndex = data.infoStat.jam_index;
    jamIndexSource = 'data.infoStat.jam_index';
  } else if (data.global?.infoStat?.jam_index !== undefined) {
    jamIndex = data.global.infoStat.jam_index;
    jamIndexSource = 'data.global.infoStat.jam_index';
  } else {
    console.warn('未找到jam_index字段');
  }
  
  console.log('原始jam_index值:', jamIndex, '类型:', typeof jamIndex, '来源:', jamIndexSource);
  
  // 确保jam_index是数字类型，处理可能的字符串类型数据
  let parsedJamIndex = 0;
  if (typeof jamIndex === 'string') {
    parsedJamIndex = parseFloat(jamIndex);
    console.log('字符串转换为数字:', parsedJamIndex);
  } else if (typeof jamIndex === 'number') {
    parsedJamIndex = jamIndex;
    console.log('直接使用数字值:', parsedJamIndex);
  } else {
    // 处理其他类型，如对象、数组等
    console.warn('jam_index不是有效的数字类型，类型为:', typeof jamIndex, '值为:', jamIndex);
    parsedJamIndex = 0;
  }
  
  // 检查解析后的值是否为有效数字
  if (isNaN(parsedJamIndex)) {
    console.warn('jam_index解析后为NaN，重置为0');
    parsedJamIndex = 0;
  }
  
  console.log('解析后jam_index:', parsedJamIndex);
  
  // 限制拥堵指数范围在0-1之间
  const clampedJamIndex = Math.max(0, Math.min(1, parsedJamIndex));
  console.log('范围限制后(0-1):', clampedJamIndex);
  
  // 四舍五入到两位小数
  congestionIndex.value = Math.floor(clampedJamIndex * 100) / 100;
  console.log('最终拥堵指数:', congestionIndex.value);
  console.log('=== 拥堵指数处理完成 ===');
  
  // 排队时间和长度处理
  queuingTimeData.value = Math.max(0, Math.floor((data.global?.queue_time_ave || 0) * 100) / 100);
  queuingLengthData.value = Math.max(0, Math.floor((data.global?.queue_length_ave || 0) * 100) / 100);
  
  // 更新图表数据数组
  trafficInArray.value.push([maxStep.value, trafficInData.value]);
  trafficOutArray.value.push([maxStep.value, trafficOutData.value]);
  carSpeedArray.value.push([maxStep.value, carSpeedData.value]);
  congestionIndexArray.value.push([maxStep.value, congestionIndex.value]);
  stoppingTimesArray.value.push([maxStep.value, stoppingTimesData.value]);
  queuingLengthArray.value.push([maxStep.value, queuingLengthData.value]);
  queuingTimeArray.value.push([maxStep.value, queuingTimeData.value]);
  
  // 更新底部图表
  if (chartVehicleSpeed) {
    chartVehicleSpeed.setOption({ series: [{ data: carSpeedArray.value }] });
  }
  if (chartCongestion) {
    chartCongestion.setOption({ series: [{ data: congestionIndexArray.value }] });
  }
}

// 打开更多统计数据对话框
function openMoreStats() {
  dialogVisible.value = true;
  nextTick(() => {
    drawDialogCharts();
  });
}

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
    GetPluginCode(plugin_name).then((code_text: string) => {
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
  ws.value?.send(JSON.stringify(delay_msg));
  return true;
}

// 使用标准 WebSocket API DEV环境为localhost 生产环境为ip
// 从localStorage获取userId
let userId = '';
try {
  const userInfoStr = localStorage.getItem('traffic_sim_user_info');
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr);
    userId = userInfo.id || '';
  }
} catch (error) {
  console.error('Failed to parse user info:', error);
}

// 将ws改为ref类型，以便在组件的其他部分使用
const ws = ref<WebSocket | null>(null);

// 初始化WebSocket连接的函数
function initWebSocket() {
  if (!taskId.value) {
    console.error("taskId is empty, cannot establish WebSocket connection");
    return;
  }
  
  // 构建WebSocket URL，使用taskId
  const wsUrl = `ws://192.168.1.212:3822/ws/frontend/${taskId.value}`;
  ws.value = new WebSocket(wsUrl);
  
  // 监听连接建立
  ws.value.onopen = () => {
    console.log("WebSocket connected");
    let hello_msg = {type: "backend", ope:"hello", time: 0};
    let timestamp = Date.now();
    hello_msg.time = timestamp;
    ws.value?.send(JSON.stringify(hello_msg));
  };
  
  // 监听消息接收
  ws.value.onmessage = (event) => {
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
          ws.value?.send(JSON.stringify(set_plugin_msg));
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
        console.log('=== 接收到sim_one_step消息 ===');
        console.log('sim_one_step完整数据:', JSON.stringify(msg_obj_data, null, 2));
        
        const next_step = msg_obj_data.next_step + 1;
        cur_step_num.value = next_step;
        
        // 处理sim_one_step中的统计数据
        if (msg_obj_data.infoStat) {
          console.log('infoStat存在，调用updateStatistics');
          updateStatistics(msg_obj_data.infoStat);
        } else {
          console.warn('infoStat不存在，跳过统计数据更新');
          console.log('msg_obj_data:', JSON.stringify(msg_obj_data, null, 2));
        }
      }
      
    }
  } else {
    AddLogPanelMsg("接收到未知消息")
  }
};

// 监听连接关闭
  ws.value.onclose = () => {
    console.log("WebSocket connection closed");
  };
  
  // 监听错误
  ws.value.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

function OnClickStart() {
  if (each_step_delay.value == 0) {
    ElMessage.warning("注意! 仿真延迟为0");
  }

  let start_msg = { type:"eng", ope:"start", time:0};
  let timestamp = Date.now();
  start_msg.time = timestamp;
  ws.value?.send(JSON.stringify(start_msg));
}

function OnClickPause() {
  let pause_msg = { type:"eng", ope:"pause", time:0};
  let timestamp = Date.now();
  pause_msg.time = timestamp;
  ws.value?.send(JSON.stringify(pause_msg));
}

function OnClickStop() {
  let stop_msg = { type:"eng", ope:"stop", time:0};
  let timestamp = Date.now();
  stop_msg.time = timestamp;
  ws.value?.send(JSON.stringify(stop_msg));
}

function OnClickSetMaxStep(step_num:number) {
  let setmaxstep_msg = { type:"eng", ope:"setmaxstep", time:0, data:{Step:0}};
  let timestamp = Date.now();
  setmaxstep_msg.time = timestamp;
  setmaxstep_msg.data.Step = step_num;
  ws.value?.send(JSON.stringify(setmaxstep_msg));
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
  
  // 重置统计数据，防止历史数据累积
  resetStatisticsData();
  
  // 初始化统计图表
  drawFooterCharts();
  
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
  
  // 获取taskId
  PrepareSimulation().then(rep => {
    if (rep && rep.res === "ERR_OK") {
      taskId.value = rep.data;
      AddLogPanelMsg("获取taskId成功: " + taskId.value);
      
      // 初始化WebSocket连接
      initWebSocket();
      
      // 调用仿真引擎启动接口
      CreateSimEng(taskId.value, sim_info, control_views).then(rep => {
        //console.log(rep);
        AddLogPanelMsg("请求创建仿真引擎完成");
      });
    } else {
      AddLogPanelMsg("获取taskId失败");
      console.error("获取taskId失败:", rep);
    }
  });

});

// 重置统计数据
function resetStatisticsData() {
  // 重置关键指标
  congestionIndex.value = 0;
  queuingTimeData.value = 0;
  queuingLengthData.value = 0;
  trafficInData.value = 0;
  trafficOutData.value = 0;
  stoppingTimesData.value = 0;
  carSpeedData.value = 0;
  
  // 重置图表数据数组
  trafficInArray.value = [];
  trafficOutArray.value = [];
  carSpeedArray.value = [];
  congestionIndexArray.value = [];
  stoppingTimesArray.value = [];
  queuingLengthArray.value = [];
  queuingTimeArray.value = [];
  
  // 重置辅助数据
  maxStep.value = 0;
  tempIndex.value = 0;
  
  // 重置当前步数
  cur_step_num.value = 1;
}

// 在组件卸载时断开连接
onUnmounted(() => {
  OnClickStop();//触发一次关闭引擎的操作
  ws.value?.close();
  // 销毁图表实例
  if (chartVehicleSpeed) {
    chartVehicleSpeed.dispose();
  }
  if (chartCongestion) {
    chartCongestion.dispose();
  }
  dialogCharts.forEach(chart => chart.dispose());
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
    ws.value?.send(JSON.stringify(stop_msg));
    ws.value?.close();
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

/* 统计信息模块样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.el-statistic__title) {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

:deep(.el-statistic__value) {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-color-primary);
}

:deep(.el-statistic__suffix) {
  font-size: 18px;
  color: var(--el-text-color-secondary);
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color);
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 响应式设计调整 */
@media (max-width: 768px) {
  :deep(.el-statistic__title) {
    font-size: 12px;
  }
  
  :deep(.el-statistic__value) {
    font-size: 20px;
  }
  
  :deep(.el-statistic__suffix) {
    font-size: 14px;
  }
  
  :deep(.el-card__body) {
    padding: 12px;
  }
}

/* 新的统计信息模块样式 - 深色主题 */
.statistics-container {
  width: 100%;
  height: auto;
  background-color: #394056;
  border-radius: 4px;
  overflow: hidden;
}

.statistics-top {
  width: 100%;
  padding: 20px;
}

.top-title {
  width: 100%;
  color: #b7b7b9;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 80px;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
}

.statistics-mid {
  width: 100%;
  padding: 20px 0;
}

.statistics-footer {
  width: 100%;
  height: 200px;
}

.chart-footer {
  width: 100%;
  height: 160px;
}

.chart {
  width: 100%;
  height: 200px;
  margin-top: 0px;
}

.line {
  margin-left: 10px;
  margin-right: 10px;
  width: calc(100% - 20px);
  height: 1px;
}

.stat-item {
  width: 150px;
  margin-bottom: 20px;
}

.stat-score {
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 18px;
  color: #ffffff;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 20px;
}

.stat-text {
  padding-left: 40px;
  color: #b7b7b9;
  font-size: 14px;
}

.point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
}

.score {
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 40px;
  color: #ffffff;
  padding-left: 20px;
  padding-top: 20px;
}

.more-button {
  margin: 0 auto;
  width: 200px;
  text-align: center;
  font-size: 14px;
  color: #ffffff;
  height: 30px;
  padding: 10px 0;
  cursor: pointer;
}

.more-button:hover {
  text-decoration: underline;
}

/* 对话框样式 */
:deep(.stats-dialog .el-dialog__header) {
  background-color: #394056;
  border-bottom: 1px solid #57617B;
}

:deep(.stats-dialog .el-dialog__title) {
  color: #ffffff;
}

:deep(.stats-dialog .el-dialog__body) {
  background-color: #394056;
  padding: 20px;
}

:deep(.stats-dialog .el-dialog__footer) {
  background-color: #394056;
  border-top: 1px solid #57617B;
}

.dialog-content {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  background-color: #394056;
}

.dialog-card {
  width: 400px;
  margin-top: 20px;
  background-color: #394056;
  border: 1px solid #57617B;
}

.dialog-chart {
  width: 400px;
  height: 400px;
}

/* 进度条样式调整 */
:deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-progress-bar__inner) {
  background-color: rgb(137, 189, 27);
}

/* 调整element plus组件样式 */
:deep(.el-card) {
  background-color: transparent;
  border: none;
}

:deep(.el-card__body) {
  background-color: transparent;
  padding: 0;
}

/* 响应式设计调整 */
@media (max-width: 768px) {
  .stat-item {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .chart {
    height: 150px;
  }
  
  .dialog-card {
    width: 100%;
  }
  
  .dialog-chart {
    width: 100%;
    height: 300px;
  }
}

.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.param-label {
  min-width: 160px;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}
</style>
