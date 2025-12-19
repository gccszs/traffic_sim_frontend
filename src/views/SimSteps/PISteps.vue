<template>
  <!--此row用于显示step提示-->
  <el-row justify="center">
    <el-col :span="24">
      <el-steps :active="cur_step_num" align-center>
        <el-step title="设置仿真名称" />
        <el-step title="设置路网地图" />
        <el-step title="设置仿真参数" />
        <el-step title="设置插件应用" />
      </el-steps>
    </el-col>
  </el-row>

  <el-divider />

  <!--此row用于显示参数设定---->
  <el-row justify="center" v-loading="checking_last_step_data" element-loading-text="等待验证(上一步)的数据...">
    <el-form :model="sim_info" label-width="100px">
      <!--第1步: 设置仿真名称-->
      <el-form-item justify="center" v-if="cur_step_num == 1" label="仿真名称: ">
        <el-input style="width: 20vw" v-model="sim_info.name" />
      </el-form-item>

      <!--第2步: 设置路网地图-->
      <el-form-item v-if="cur_step_num == 2">
        <el-card class="box-card" :style="{ height: 'fit-content', minHeight: '600px' }">
          <template #header>
            <div class="card-header">
              <span>当前地图格式:</span>
              <div>
                <el-radio-group v-model="radio_map_format" size="small">
                  <el-radio-button label="txt" value="txt" />
                  <el-radio-button label="xml" value="xml" />
                  <el-radio-button label="osm" value="osm" />
                </el-radio-group>
              </div>
            </div>
          </template>
          <div>
            <span>路网描述: </span>
            <el-input v-model="map_text_content" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
          </div>
          <div><!--dev模式下action为localhost, 生产环境下改为ip(例如:127.0.0.1)-->
            <el-upload ref="upload_map" drag action="http://127.0.0.1:3822/upload_map" with-credentials
              accept=".txt,.xml,.osm" :limit="1" :before-upload="onBeforeUploadMap" :on-success="onUploadMapSuc"
              :on-error="onUploadMapErr" :on-exceed="onUploadMapExceed">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                Drop file here or <em>click to upload</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  txt/xml/osm file that contatin road map info
                </div>
              </template>
            </el-upload>
            <el-text v-if="verify_map_result !== null" class="mx-1" :type="verify_map_result ? 'success' : 'danger'">
              {{ verify_map_result ? " 路网格式验证成功!" : " 路网数据格式不正确!" }}
            </el-text>
          </div>
        </el-card>
        <el-card class="box-card" :style="{ height: 'fit-content', minHeight: '600px' }">
          <template #header>
            <div class="card-header">
              <span>地图预览:</span>
            </div>
          </template>
          <div>
            <el-image :src="sim_info.map_pic">
              <template #error>
                <div class="image-slot">
                  <el-icon><icon-picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-card>
      </el-form-item>

      <!--第3步: 设置仿真参数-->
      <el-form-item v-if="cur_step_num == 3">
        <el-card class="box-card" :style="{ height: 'fit-content', minHeight: '600px' }">
          <template #header>
            <div class="card-header">
              <span>当前路网预览:</span>
            </div>
          </template>
          <div>
            <el-image :src="sim_info.map_pic" :preview-src-list="[sim_info.map_pic]">
              <template #error>
                <div class="image-slot">
                  <el-icon><icon-picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-card>
        <el-card class="box-card" :style="{ height: 'fit-content', minHeight: '600px', weight: 'fit-content' }">
          <el-divider content-position="left">全局模型选择:</el-divider>
          <div style="display: flex; gap: 20px;">
            <!-- 跟驰模型 -->
            <el-form-item label="内置跟驰模型:">
              <el-select v-model="sim_info.fixed_od.follow_model" placeholder="请选择" style="width: 100px">
                <el-option v-for="item in carfollow_list" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <!-- 换道模型 -->
            <el-form-item label="内置换道模型:">
              <el-select v-model="sim_info.fixed_od.change_lane_model" placeholder="请选择" style="width: 100px">
                <el-option v-for="item in changelane_list" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </div>
          <el-divider content-position="left">红绿灯周期配置 (是否自动更新?):
            <el-switch v-model="auto_update_signal" style="margin-left: 40px" inline-prompt :active-icon="Check"
              :inactive-icon="Close" />
          </el-divider>
          <el-tabs type="border-card" v-model="cur_signal_tab">
            <el-tab-pane v-for="(tab, index) in signal_tabs" :key="tab.id" :label="tab.label" :name="tab.id">
              <div v-for="(signal, index) in sim_info.fixed_od.sg">
                <div v-if="signal.cross_id == tab.id" style="margin-left: 25px;"> <!--找到od中对应cross_id的signal-->
                  <div style="display: flex; align-items: center; margin-left: 3px; margin-bottom: 20px;">
                    <label style="margin-right: 20px;">周期 (60至300秒)</label>
                    <el-input-number v-model.number="signal.cycle_time" :min="60" :max="300" controls-position="right"
                      @change="onSignalTimeChanged(signal.cross_id, 'cycle')">
                    </el-input-number>
                    <p>&nbsp;&nbsp;秒</p>
                  </div>
                  <div style="display: flex; align-items: flex-start">
                    <div style="margin-right: 20px; margin-top: 10px; writing-mode: vertical-rl"> 东西走向 </div>
                    <div style="display: flex; flex-direction: column">
                      <div style="display: flex; align-items: center; margin-bottom: 10px">
                        <label style="margin-right: 20px;">直行绿灯 </label>
                        <el-input-number v-model.number="signal.ew_straight" :min="0" :max="signal.cycle_time"
                          controls-position="right" @change="onSignalTimeChanged(signal.cross_id, 'ew_s')">
                        </el-input-number>
                        <p>&nbsp;&nbsp;秒</p>
                      </div>
                      <div style="display: flex; align-items: center; margin-bottom: 10px">
                        <label style="margin-right: 20px;">左转绿灯 </label>
                        <el-input-number v-model.number="signal.ew_left" :min="0" :max="signal.cycle_time"
                          controls-position="right" @change="onSignalTimeChanged(signal.cross_id, 'ew_l')">
                        </el-input-number>
                        <p>&nbsp;&nbsp;秒</p>
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start">
                    <div style="margin-right: 20px; margin-top: 10px; writing-mode: vertical-rl"> 南北走向 </div>
                    <div style="display: flex; flex-direction: column">
                      <div style="display: flex; align-items: center; margin-bottom: 10px">
                        <label style="margin-right: 20px;">直行绿灯 </label>
                        <el-input-number v-model.number="signal.sn_straight" :min="0" :max="signal.cycle_time"
                          controls-position="right" @change="onSignalTimeChanged(signal.cross_id, 'sn_s')">
                        </el-input-number>
                        <p>&nbsp;&nbsp;秒</p>
                      </div>
                      <div style="display: flex; align-items: center; margin-bottom: 10px">
                        <label style="margin-right: 20px;">左转绿灯 </label>
                        <el-input-number v-model.number="signal.sn_left" :min="0" :max="signal.cycle_time"
                          controls-position="right" @change="onSignalTimeChanged(signal.cross_id, 'sn_l')">
                        </el-input-number>
                        <p>&nbsp;&nbsp;秒</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-card class="box-card" :style="{ height: 'fit-content', minHeight: '600px' }">
          <el-divider content-position="left">道路交通流配置 (是否自动更新?):
            <el-switch v-model="auto_update_od" style="margin-left: 40px" inline-prompt :active-icon="Check"
              :inactive-icon="Close" />
          </el-divider>
          <el-tabs type="border-card" v-model="cur_road_tab">
            <el-tab-pane v-for="(tab, index) in road_tabs" :key="tab.id" :label="tab.label" :name="tab.id"
              class="scrollable-road-tab-pane"> <!--tab.id就是Road_ID, tab.link_id就是LinkID(Object_ID)-->
              <div v-for="(flow, index) in sim_info.fixed_od.flows" :key="index">
                <div v-if="(flow.road_id == tab.link_id)" :key="tab.id">
                  <el-divider content-position="left" border-style="dashed">车辆生成的分布方案与速度(请先设置速度):</el-divider>
                  <div style="display: flex; gap: 10px;">
                    <div style="display: flex; align-items: center;">
                      <label style="width: 60px;text-align: right; margin-right: 8px;">分布方案: </label>
                      <el-select v-model="flow.policy" style="width: 100px">
                        <el-option v-for="item in flow_policy_list" :key="item.id" :label="item.name"
                          :value="item.id" />
                      </el-select>
                    </div>
                    <div v-if="[2, 3].includes(flow.policy)" style="display: flex; align-items: center;">
                      <label style="width: 60px;text-align: right; margin-right: 8px;">额外参数: </label>
                      <el-input-number v-model.number="flow.extra" controls-position="right"
                        style="width: 65px"></el-input-number>
                    </div>
                    <div v-if="[0, 1].includes(flow.policy)" style="display: flex; align-items: center;">
                      <!--当有额外参数先把这块隐藏 要不然地方不够 所以需要先设置速度-->
                      <label style="width: 65px;text-align: right; margin-right: 8px;">车辆生成: </label>
                      <el-input-number v-model.number="flow.demand" :min="1" :max="20" controls-position="right"
                        style="width: 75px"></el-input-number>
                      <p>&nbsp;(辆/Min)</p>
                    </div>
                  </div>
                </div>
              </div>
              <el-divider content-position="left" border-style="dashed">车辆从道路i到道路j的比例:</el-divider>
              <div v-for="(od, index) in sim_info.fixed_od.od" :key="index">
                <div v-if="(od.orgin_id == tab.link_id)" :key="tab.id">
                  <div v-for="(dist, index) in od.dist" :key="index">
                    <div class="od-row">
                      <p style="margin:0;padding:8px;">
                        道路{{ tab.id }} -----> 道路{{ sim_info.map_json.Link.find((item:any) => item.Object_ID == dist.dest)?.Road_ID }}
                      </p>
                      <el-input-number v-model="dist.percent" :min="0" :max="1" :precision="2" :step="0.1"
                        label="Percentage" @change="onOdPercentChanged(od.orgin_id, dist.dest, dist.percent)" />
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-form-item>

      <!--第4步: 设置插件应用-->
      <el-form-item v-if="cur_step_num == 4">
        <el-row :gutter="20">
          <el-col :span="6" v-for="(controlView, index) in control_views" :key="index"
            style="flex: 1 1 25%; max-width: 25%; min-width: 250px; margin-bottom: 20px;">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>{{ control2name_map[controlView.control_type] }}</span>
                  <el-switch v-model="controlView.use_plugin" inline-prompt
                    style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" active-text="使用插件接管"
                    inactive-text="不使用插件接管" />
                </div>
              </template>
              <div style="margin-top: 20px">
                <el-radio-group v-model="controlView.active_plugin">
                  <el-radio v-for="(plugin_name, index) in controlView.plugins" :key="index" :label="plugin_name"
                    :value="plugin_name" border>{{ controlView.plugin_names[index] }}</el-radio>
                </el-radio-group>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </el-row>

  <!--此row用于显示上一步/下一步按钮------>
  <el-row justify="end">
    <el-col :span="6" :offset="18">
      <el-button :disabled="btn_last_step_disable" type="primary" v-if="cur_step_num > 1"
        @click="onBtnChangeStepClicked(-1)">上一步</el-button>
      <el-button :disabled="btn_next_step_disable" type="primary" v-if="cur_step_num < max_step_num"
        @click="onBtnChangeStepClicked(1)">下一步</el-button>
      <el-button :disabled="btn_submit_disable" type="primary" v-else @click="onSubmit">完成</el-button>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeMount, onBeforeUnmount, markRaw } from "vue";
import type { UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { genFileId } from 'element-plus';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { Picture as IconPicture, UploadFilled, Check, Close } from '@element-plus/icons-vue'

import { GetAuthIdOnce, DelAuthIdOnce, GetMapJson, GetPluginInfo } from '@/apis/SimPIApi'
// @ts-ignore
import { generate_thumbnail } from '@/views/SimSteps/js/sim'

const router = useRouter(); //路由

const btn_next_step_disable = ref(false);
const btn_last_step_disable = ref(false);
const btn_submit_disable = ref(true);
const cur_step_num = ref(1);
const max_step_num = 4;
const checking_last_step_data = ref(false);
const verify_map_result = ref<null | boolean>(null);  //验证路网数据是否成功
const map_text_content = ref('');                     //用户上传的文件文本
const upload_map = ref<UploadInstance>();             //用于指向路网上传控件 自动替换
const radio_map_format = ref('txt');
const carfollow_list = [{ name: 'Gipps模型', id: 1 }, { name: 'VDR模型', id: 2 }, { name: 'IDM模型', id: 3 }];
const changelane_list = [{ name: '匀加速换道模型', id: 1 }, { name: '加速度自适应换道模型', id: 2 }];
const flow_policy_list = [{ name: '均匀分布', id: 0}, {name:'指数分布', id:1}, {name:'伽马分布', id:2}, {name:'正态分布', id:3}];
const road_tabs = ref([ { label: '道路1', id: 1, link_id: 1}]);
const signal_tabs = ref([ {label: '红绿灯1', id: 1} ]);
const cur_road_tab = ref(1);
const cur_signal_tab = ref(1);
const auto_update_signal = ref(false);
const auto_update_od = ref(false);
import type { PluginInfo, ManifestInfo, PluginControl } from '@/types/plugin';
import type { SimStructInfo, FixedOD, Flow, orgin, signal } from '@/types/sim';

// 这里将 map_json 使用 markRaw，防止它变成响应式数据
const sim_info = ref<SimStructInfo>({
  name: '',
  map_json: markRaw({}),  // 将 map_json 标记为非响应式
  map_pic: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
  fixed_od: reactive({
    road_num: 0,
    lane_num: 0,
    controller_num: 0,
    follow_model: 1,
    change_lane_model: 1,
    flows: [],
    od: [],
    sg: []
  })
});

interface ControlView {
  control_type: string;   //接管行为
  plugins: string[];      //有哪些插件注册了该接管行为(插件名(id))
  plugin_names: string[]; //和上一个字段的插件id一一对应
  active_plugin: string;  //当前应用了哪个插件   
  use_plugin: boolean;    //使用插件接管
}

// 从接管行为的视图, 例如'产生车辆'有哪些插件
const control_views = ref<ControlView[]>([{control_type: 'pv', plugins: ['test'], plugin_names: ['测试'], active_plugin: 'test', use_plugin: true},]);
const control2name_map:any = {"pv":"产生车辆", "lr": "Link运动", "cr": "Cross运动", "cu":"Controller运动", "cf":"跟驰模型", "cl":"换道模型"};    //control类型到实际名字的映射

let plugin_infos:PluginInfo[] = [
  {
    plugin_name: "example",
    manifest: {
      name: "example_plugin",
      file: "/path/to/example_plugin.py",
      control: {
        "pv": {
          call: "some_function",
          frequency: 0,
          enable: true,
        },
      },
      enable_main: true,
    }
  },];

// 向后端请求一次仿真的身份认证
onMounted(() => {

  GetAuthIdOnce().then(id => {
    if (id === null) {
      ElMessage({
        message: '获取id失败!',
        type: 'error',
        duration: 5000,
        showClose: true
      });
    } else {
      ElMessage({
        message: '获取一次id成功: ' + id,
        type: 'success',
        showClose: true
      });
    }
  });

});

// 拦截路由变化
onBeforeRouteLeave((to, from, next) => {
  if (to.path != "/simpi") {//如果不是到达开始仿真页面则询问
    const answer = window.confirm('你有未保存的操作，确定要离开吗？');
    if (answer) {
      // 用户点击 "是"，发送请求
      DelAuthIdOnce();
      next();  // 允许导航
    } else {
      next(false);  // 阻止导航
    }
  } else {
    next();
  }
});

const onBtnChangeStepClicked = (step: number) => {
  cur_step_num.value += step;
  //当到了第二步时, 需要判断第一步是否成功设置了仿真名称
  if (cur_step_num.value == 2) {
    checking_last_step_data.value = true;
    if (sim_info.value.name.length == 0) {
      ElMessage({
        showClose: true,
        message: '未设置仿真名称, 请返回上一步修改!',
        type: 'warning',
        duration: 5000
      });
      btn_next_step_disable.value = true;
    }
    checking_last_step_data.value = false;
  } else if (cur_step_num.value == 3) { //当到了第三步: 设置仿真参数 时, 需要判断第二步是否成功设置了路网地图
    if ((verify_map_result.value == false) || (verify_map_result.value === null)) {
      checking_last_step_data.value = true;
      btn_next_step_disable.value = true;
    } else {
      //设置交通流OD配置信息选择界面
      //1.遍历od获取Road_ID
      const road_tab_names: any = [];
      for (let od of sim_info.value.fixed_od.od) {
        const orgin_link_id = od.orgin_id;
        const road_id = sim_info.value.map_json.Link.find((item:any) => item.Object_ID == orgin_link_id)?.Road_ID;
        road_tab_names.push({ label: '道路' + road_id, id: road_id, link_id: orgin_link_id });
      }
      road_tabs.value = road_tab_names;
      if (road_tab_names.length > 0) cur_road_tab.value = road_tab_names[0].id;

      //2.遍历Controller获取Cross_ID
      const signal_tab_names: any = [];
      for (let controller_value of sim_info.value.map_json.Controller) {
        const cross_id = controller_value.Cross_ID;
        signal_tab_names.push({ label: '红绿灯' + (cross_id + 1), id: cross_id });
      }
      signal_tabs.value = signal_tab_names;
      if (signal_tab_names.length > 0) cur_signal_tab.value = signal_tab_names[0].id;
    }
  } else if (cur_step_num.value == 4) { //当到了第4步时, 需要判断第三步的OD数据是否正确
    checking_last_step_data.value = true;
    
    function isAlmostEqual(a: number, b: number, epsilon: number = 1e-10): boolean {
      return Math.abs(a - b) < epsilon; //浮点数比较
    }
    
    let check_od = true, check_signal = true;
    for (let orgin_value of sim_info.value.fixed_od.od) {
      let dist_percent_all = 0.0;
      for (let dist_value of orgin_value.dist) {
        dist_percent_all += dist_value.percent;
      }
      if (!isAlmostEqual(dist_percent_all, 1.0)) {
        check_od = false;
        break;
      }
    }
    for (let signal_value of sim_info.value.fixed_od.sg) {
      let time_all = signal_value.ew_left + signal_value.ew_straight + signal_value.sn_left + signal_value.sn_straight;
      if (time_all != signal_value.cycle_time) {
        check_signal = false;
        break;
      }
    }
    if (!check_od || !check_signal) {
      ElMessage({
        showClose: true,
        message: '仿真参数不正确, 请返回上一步修改!',
        type: 'warning',
        duration: 5000
      });
      btn_submit_disable.value = true;
    } else { //验证成功, 请求插件数据
      GetPluginInfo("all").then(pinfos => {
        plugin_infos = pinfos as PluginInfo[];
        //转为接管行为视图
        // 初始化一个 Map 用于存储 ControlView，以便处理相同 control_type 的情况
        const controlMap: Map<string, ControlView> = new Map();
        for (const pluginInfo of plugin_infos) {
          if (!pluginInfo.manifest.enable_main) {
            continue; //说明该插件没开启
          }
          const pluginName = pluginInfo.plugin_name;
          const controls = pluginInfo.manifest.control;
          for (const controlType in controls) {
            const pluginControl = controls[controlType];
            if (!pluginControl.enable) {
              continue; //说明该插件的该接管行为逻辑没开启
            }

            // 如果 controlMap 中没有该 control_type，则初始化一个新的 ControlView
            if (!controlMap.has(controlType)) {
              controlMap.set(controlType, {
                control_type: controlType,
                plugins: [],
                plugin_names: [],
                active_plugin: '',
                use_plugin: true
              });
            }

            // 获取当前 controlType 对应的 ControlView
            const controlView = controlMap.get(controlType)!;

            // 将插件名添加到 plugins 数组中
            controlView.plugins.push(pluginName);
            controlView.plugin_names.push(pluginInfo.manifest.name);

            // 判断该插件是否为 active_plugin
            if (pluginControl.enable && controlView.active_plugin === '') {
              controlView.active_plugin = pluginName;
            }
          }
        }
        control_views.value = Array.from(controlMap.values());

        btn_submit_disable.value = false;
      });
    }

    checking_last_step_data.value = false;
  } else {
    checking_last_step_data.value = false;
    btn_next_step_disable.value = false;
  }
}

function onBeforeUploadMap(rawFile: UploadRawFile) {
  const file_name = rawFile.name;
  const file_extension = file_name.substring(file_name.lastIndexOf('.') + 1).toLowerCase();
  const allowed_extensions = ['txt', 'xml', 'osm'];
  if (!allowed_extensions.includes(file_extension)) {
    ElMessage.error('不被允许的文件类型!');
    return false; // 阻止上传
  }
  btn_next_step_disable.value = true;
  btn_last_step_disable.value = true;
  radio_map_format.value = file_extension;

  //将文本显示在input中
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    // 检查 result 是否是字符串类型
    if (typeof result === 'string') {
      map_text_content.value = result; // 读取的文件内容是字符串，赋值给 map_text_content
    } else {
      ElMessage.error('文件内容不是有效的文本格式');
    }
  };
  // 读取文件的文本内容
  reader.readAsText(rawFile);

  //打开等待UI
  checking_last_step_data.value = true;
  return true; // 允许上传
}

function onUploadMapSuc(response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  checking_last_step_data.value = false;
  btn_last_step_disable.value = true;
  if (response.res != "ERR_OK") {
    ElMessage({
      showClose: true,
      message: 'Oops, ' + response.msg,
      type: 'error',
      duration: 0
    });
    verify_map_result.value = false;
  }
  else {
    if (response.addition != "old") {
      ElMessage({
        showClose: true,
        message: '注意: 使用了新版的txt转xml方法, 路网结构可能出错!',
        type: 'warning',
        duration: 10000
      });
    }
    //地图上传成功, 且验证通过
    verify_map_result.value = true;
    btn_last_step_disable.value = false;
    btn_next_step_disable.value = false;
    // 拿到地图的json格式
    GetMapJson().then(map_json_obj => {
      const lane_num = map_json_obj['Link'][0]['Lane_Number'];
      const map_pic_url = generate_thumbnail(map_json_obj, lane_num, true, true);
      sim_info.value.map_pic = map_pic_url; //设置预览图
      sim_info.value.map_json = markRaw(map_json_obj);

      //先清空
      sim_info.value.fixed_od.od = [];
      sim_info.value.fixed_od.flows = [];
      sim_info.value.fixed_od.sg = [];

      // 设置部分路网数据
      const road_num = map_json_obj.Link.length / 2;
      sim_info.value.fixed_od.road_num = road_num;
      sim_info.value.fixed_od.lane_num = map_json_obj.Link[0].Lane_Number;        //按理说每条Link的Lane可以是不固定的, 但实际只能是固定的
      sim_info.value.fixed_od.controller_num = map_json_obj.Controller.length;

      const origin_points_id:Array<number> = [];    //所有源点的LinkID
      const dest_points_id:Array<number> = [];       //所有终点的LinkID
      for (let link_value of sim_info.value.map_json.Link) {  
        if ((link_value.Is_Origin == 1) && (link_value.Link_Start.Object_Type == 'M')) {
          origin_points_id.push(link_value.Object_ID);
          let one_flow:Flow = {road_id:0, policy:1, demand:5, extra:1.0}; //设置flow
          one_flow.road_id = link_value.Object_ID;
          sim_info.value.fixed_od.flows.push(one_flow);
        }
        if ((link_value.Is_Dest == 1) && (link_value.Link_End.Object_Type == 'M')) {
          dest_points_id.push(link_value.Object_ID);
        }
      }
      
      let average_percent: number = 0.0;                                          //平均每个Link到达另一个Link的概率
      average_percent = 1 / (dest_points_id.length);
      //设置初始OD数据
      for (let origin_id of origin_points_id) {
        let one_od: orgin = { orgin_id: origin_id, dist: [] };
        for (let dest_id of dest_points_id) {
          one_od.dist.push({ dest: dest_id, percent: average_percent });
        }
        sim_info.value.fixed_od.od.push(one_od);
      }

      for (let controller_value of map_json_obj.Controller) {                   //通过Controller设置FixedOD中的SG->signal数据
        let one_signal: signal = {cross_id: 0, cycle_time: 0, ew_left: 0, ew_straight: 0, sn_left: 0, sn_straight: 0};
        one_signal.cross_id = controller_value.Cross_ID;
        one_signal.cycle_time = 60;
        one_signal.ew_left = 15;
        one_signal.ew_straight = 15;
        one_signal.sn_left = 15;
        one_signal.sn_straight = 15;
        sim_info.value.fixed_od.sg.push(one_signal);
      }

      //console.log(sim_info.value);
    });
  }
}

function onUploadMapErr(error: Error, uploadFile: UploadFile, uploadFiles: UploadFiles) {
  checking_last_step_data.value = false;
  ElMessage({
    showClose: true,
    message: 'Oops, ' + error,
    type: 'error',
    duration: 0
  });
}

const onUploadMapExceed: UploadProps['onExceed'] = (files) => {
  verify_map_result.value = null;
  upload_map.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload_map.value!.handleStart(file);
  upload_map.value!.submit();
}

//当signal time改变时
function onSignalTimeChanged(cross_id: number, type: string) {
  if (auto_update_signal.value == true) {
    let target_signal:any = null;
    for (let i = 0; i < sim_info.value.fixed_od.sg.length; i++) {
      let cur_signal = sim_info.value.fixed_od.sg[i];
      if (cur_signal.cross_id == cross_id) {
        target_signal = sim_info.value.fixed_od.sg[i];
        break;
      }
    }
    if (type == 'cycle') {
      ;//暂时不写
    } else {
      target_signal.cycle_time = target_signal.sn_left + target_signal.sn_straight + target_signal.ew_left + target_signal.ew_straight;
    }
  }
}

//当输入框内OD percent改变时
function onOdPercentChanged(orgin_id: number, dest_id: number, changed_per: number) {
  if (auto_update_od.value == true) {
    for (let i = 0; i < sim_info.value.fixed_od.od.length; i++) {
      let cur_od_value = sim_info.value.fixed_od.od[i];
      if (cur_od_value.orgin_id == orgin_id) {
        const residual_per = 1 - changed_per;
        const new_others_per: number = (residual_per) / (cur_od_value.dist.length - 1);
        for (let dist_value of cur_od_value.dist) {
          if (dist_value.dest == dest_id) {
            dist_value.percent = changed_per;
          }
          else {
            dist_value.percent = new_others_per;
          }
        }
        break;
      }
    }
  }
}

const onSubmit = () => {
  //console.log("submit!sim_info: ", sim_info.value);
  //console.log("submit!control_view: ", control_views.value);

  sessionStorage.setItem('sim_info', JSON.stringify(sim_info.value));
  sessionStorage.setItem('control_views', JSON.stringify(control_views.value));
  router.push({ name: "startsimpi" }); //切换到开始仿真路由, 并把参数使用sessionStorage传过去
};
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 25px;
}

.card-text {
  font-size: 14px;
}

.card-item {
  margin-bottom: 18px;
}

.box-card {
  width: 480px;
  height: 360px;
}

.od-row {
  display: flex; /* 使用 Flexbox 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 两个元素之间留出空隙 */
  margin-bottom: 8px; /* 给每行一些间距 */
}

.od-row p {
  flex: 1; /* 让 p 标签占据一部分空间 */
}

.od-row el-input-number {
  flex: 1; /* 让输入框也占据同样的空间 */
  margin-left: 16px; /* 给输入框和 p 标签之间添加一些空隙 */
}

.scrollable-road-tab-pane {
  max-height: 440px; /* 设置最大高度*/
  overflow-y: auto; /* 当内容超出时，自动出现竖向滚动条 */
  padding-right: 16px; /* 为滚动条预留空间，避免内容被滚动条遮挡 */
}
</style>
