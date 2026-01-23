<template>
  <div class="sim-replay-container">
    <!-- 顶部导航栏 -->
    <div class="replay-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">仿真回放 - {{ taskId }}</span>
        </template>
        <template #extra>
          <el-button @click="goBack">返回列表</el-button>
        </template>
      </el-page-header>
    </div>

    <!-- 主内容区域 -->
    <div class="replay-content">
      <!-- 左侧地图显示区域 -->
      <div class="map-container">
        <canvas id="replay_pixi" width="1000" height="650"></canvas>
      </div>

      <!-- 右侧控制面板 -->
      <div class="control-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>回放控制</span>
            </div>
          </template>

          <!-- 播放控制按钮 -->
          <div class="control-buttons">
            <el-button 
              type="primary" 
              :icon="VideoPlay" 
              @click="togglePlay"
              :disabled="!isMapLoaded"
            >
              {{ isPlaying ? '暂停' : '播放' }}
            </el-button>
            <el-button 
              type="info" 
              :icon="VideoPause" 
              @click="stop"
              :disabled="!isMapLoaded"
            >
              停止
            </el-button>
            <el-button 
              type="warning" 
              :icon="RefreshLeft" 
              @click="resetPlayback"
              :disabled="!isMapLoaded"
            >
              重置
            </el-button>
          </div>

          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-info">
              <span>当前步数: {{ currentStep }} / {{ totalSteps }}</span>
              <span>{{ progressPercent.toFixed(1) }}%</span>
            </div>
            <el-slider 
              v-model="currentStep" 
              :min="0" 
              :max="totalSteps" 
              :show-tooltip="true"
              :disabled="!isMapLoaded"
              @change="onStepChange"
            />
          </div>

          <!-- 速度控制 -->
          <div class="speed-section">
            <span>播放速度:</span>
            <el-select v-model="playbackSpeed" style="width: 120px; margin-left: 10px;" @change="onSpeedChange">
              <el-option label="0.5x" :value="0.5" />
              <el-option label="1x" :value="1" />
              <el-option label="2x" :value="2" />
              <el-option label="4x" :value="4" />
            </el-select>
          </div>

          <!-- 显示选项 -->
          <div class="display-options">
            <div class="option-item">
              <el-switch v-model="showRoadNumbers" active-text="道路标号" @change="onShowControlChange" />
            </div>
            <div class="option-item">
              <el-switch v-model="showCrossNumbers" active-text="路口标号" @change="onShowControlChange" />
            </div>
            <div class="option-item">
              <el-button color="#626aef" @click="resetMapPosition">重置路网位置</el-button>
            </div>
          </div>
        </el-card>


      </div>
    </div>

    <!-- 加载状态 -->
    <el-loading :fullscreen="true" :spinning="isLoading" text="正在加载地图数据..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { VideoPlay, VideoPause, RefreshLeft } from '@element-plus/icons-vue';
import { SimPIXI } from '@/mods/SimPIXI';
// 导入sim.js中的生成缩略图和坐标处理函数
import { generate_thumbnail, get_roadnetwork_xy } from './SimSteps/js/sim';

// 定义地图信息接口
interface MapInfo {
  map_name?: string;
  link_count?: number;
  cross_count?: number;
  [key: string]: any;
}

// 定义回放数据接口
interface ReplayStep {
  step: number;
  vehicles: any[];
  controllers: any[];
  [key: string]: any;
}

// 响应式数据
const isLoading = ref(true);
const isMapLoaded = ref(false);
const isPlaying = ref(false);
const taskId = ref('');
const mapInfo = ref<MapInfo | null>(null);
const replayData = ref<ReplayStep[]>([]);
const currentStep = ref(0);
const totalSteps = ref(0);
const playbackSpeed = ref(1);
const showRoadNumbers = ref(false);
const showCrossNumbers = ref(false);

// 画布实例
let sim_pixi: SimPIXI | null = null;
let playbackTimer: number | null = null;

// 存储不同显示模式的背景图片
let bg_pics = {none:'', withRoadNume:'', withCrossNume:'', withAll:''};

// SSE相关
let eventSource: EventSource | null = null;
let isSseConnected = ref(false);
let sessionId = ref('');

// 计算进度百分比
const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0;
  return (currentStep.value / totalSteps.value) * 100;
});

// 获取路由参数
const route = useRoute();
const router = useRouter();

// 返回上一页
const goBack = () => {
  // 清理资源
  cleanup();
  // 返回仿真记录列表页
  router.push('/simrecords');
};

// 清理资源
const cleanup = () => {
  // 停止播放定时器
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
  
  // 关闭SSE连接
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    isSseConnected.value = false;
  }
  
  // 清理画布
  if (sim_pixi) {
    sim_pixi.clearCanvas();
    sim_pixi = null;
  }
  
  // 清理sessionStorage数据
  sessionStorage.removeItem('replay_mapInfo');
  sessionStorage.removeItem('replay_taskId');
};

// 初始化地图
const initMap = () => {
  try {
    // 从sessionStorage获取地图数据
    const mapInfoStr = sessionStorage.getItem('replay_mapInfo');
    const storedTaskId = sessionStorage.getItem('replay_taskId');
    
    if (!mapInfoStr || !storedTaskId) {
      throw new Error('地图数据不存在，请返回重新操作');
    }
    
    // 设置taskId和sessionId
    taskId.value = storedTaskId;
    sessionId.value = storedTaskId;
    
    // 解析地图数据
    try {
      mapInfo.value = JSON.parse(mapInfoStr);
    } catch (parseError) {
      console.error('解析地图数据失败:', parseError);
      throw new Error('地图数据格式错误，请返回重新操作');
    }
    
    // 初始化PIXI画布
    const canvas = document.getElementById('replay_pixi') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('找不到画布元素');
    }
    
    // 获取canvas的实际显示尺寸，而不是HTML属性尺寸
    const rect = canvas.getBoundingClientRect();
    const actualWidth = Math.round(rect.width);
    const actualHeight = Math.round(rect.height);
    
    // 更新canvas的HTML属性，确保坐标系正确
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    
    sim_pixi = new SimPIXI(actualWidth, actualHeight);
    
    // 附加到DOM元素
    const success = sim_pixi.appendSimPIXI('replay_pixi');
    if (!success) {
      throw new Error('初始化画布失败');
    }
    
    // 生成路网缩略图并设置背景
    generateRoadNetworkThumbnail();
    
    // 初始化完成后，重置变换，确保元素位置正确
    if (sim_pixi) {
      sim_pixi.resetTransform();
    }
    
    // 标记地图已加载
    isMapLoaded.value = true;
    isLoading.value = false;
    
    ElMessage.success('地图加载成功');
    
    // 建立SSE连接
    connectSSE();
  } catch (error: any) {
    console.error('初始化地图失败:', error);
    ElMessage.error(error.message || '初始化地图失败');
    isLoading.value = false;
  }
};

// 建立SSE连接
const connectSSE = () => {
  if (!sessionId.value) {
    console.error('sessionId为空，无法建立SSE连接');
    return;
  }
  
  // 关闭现有连接
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  
  try {
    // 获取token
    let token;
    try {
      token = getToken();
    } catch (error) {
      console.error('未找到token，无法建立SSE连接');
      ElMessage.error('未登录或登录已过期，请重新登录');
      return;
    }
    
    // 建立新的SSE连接，使用正确的后端URL和Authorization头
    const sseUrl = `http://192.168.1.212:3822/replay/stream/${sessionId.value}`;
    
    // 使用fetch API创建SSE连接，支持自定义请求头
    fetch(sseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream'
      },
      credentials: 'include' // 包含cookies
    }).then(response => {
      if (!response.ok) {
        // 处理401未授权错误
        if (response.status === 401) {
          localStorage.removeItem('traffic_sim_token');
          localStorage.removeItem('traffic_sim_user_info');
          ElMessage.error('登录已过期，请重新登录');
          window.location.href = '/login';
          throw new Error('登录已过期');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser');
      }
      
      isSseConnected.value = true;
      console.log('SSE连接已建立:', sseUrl);
      
      // 处理SSE流
      const reader = response.body.getReader();
      let buffer = '';
      let currentEvent = { type: '', data: '' };
      
      // 解析SSE事件的函数
      const parseEventStream = (chunk: string) => {
        buffer += chunk;
        let lineStart = 0;
        let lineEndIndex;
        
        while ((lineEndIndex = buffer.indexOf('\n', lineStart)) !== -1) {
          const line = buffer.slice(lineStart, lineEndIndex).trimEnd();
          lineStart = lineEndIndex + 1;
          
          if (line === '') {
            // 空行表示事件结束，处理完整事件
            if (currentEvent.type && currentEvent.data) {
              handleSSEEvent(currentEvent.type, currentEvent.data);
            }
            // 重置事件
            currentEvent = { type: '', data: '' };
            continue;
          }
          
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) {
            // 没有冒号，整个行是事件类型
            currentEvent.type = line;
            continue;
          }
          
          const field = line.slice(0, colonIndex).trim();
          const value = line.slice(colonIndex + 1).trimStart();
          
          if (field === 'event') {
            // 事件类型
            currentEvent.type = value;
          } else if (field === 'data') {
            // 事件数据，可能多行，需要拼接
            currentEvent.data += currentEvent.data ? '\n' + value : value;
          }
        }
        
        // 如果buffer中还有内容，保留到下一次处理
        buffer = buffer.slice(lineStart);
      };
      
      // 处理SSE事件的函数
      const handleSSEEvent = (eventType: string, eventData: string) => {
        try {
          const data = JSON.parse(eventData);
          console.log(`收到${eventType}事件:`, data);
          
          switch (eventType) {
            case 'start':
              // 回放开始
              totalSteps.value = data.totalSteps;
              currentStep.value = 0;
              break;
            case 'data':
              // 步数据
              currentStep.value = data.step;
              // 更新画布显示
              updatePlaybackFrame(data);
              break;
            case 'seeked':
              // 跳转完成
              currentStep.value = data.currentStep;
              break;
            case 'stopped':
              // 已停止
              currentStep.value = data.currentStep;
              isPlaying.value = false;
              break;
            case 'end':
              // 回放完成
              isPlaying.value = false;
              ElMessage.success(data.message || '回放完成');
              break;
            case 'error':
              // 错误
              ElMessage.error(data || '回放发生错误');
              break;
            default:
              console.log(`未知事件类型: ${eventType}`);
          }
        } catch (error) {
          console.error(`解析${eventType}事件数据失败:`, error);
        }
      };
      
      // 读取SSE流
      const readStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('SSE流已关闭');
            isSseConnected.value = false;
            // 处理缓冲区中剩余的事件
            if (currentEvent.type && currentEvent.data) {
              handleSSEEvent(currentEvent.type, currentEvent.data);
            }
            return;
          }
          
          // 将Uint8Array转换为字符串
          const chunk = new TextDecoder().decode(value);
          parseEventStream(chunk);
        }
      };
      
      readStream().catch(error => {
        console.error('读取SSE流失败:', error);
        isSseConnected.value = false;
        ElMessage.error('SSE流读取失败');
      });
    }).catch(error => {
      console.error('建立SSE连接失败:', error);
      isSseConnected.value = false;
      ElMessage.error('建立SSE连接失败');
      // 尝试重新连接
      setTimeout(() => {
        if (!isSseConnected.value) {
          console.log('尝试重新建立SSE连接...');
          connectSSE();
        }
      }, 3000);
    });
    
  } catch (error) {
    console.error('建立SSE连接失败:', error);
    isSseConnected.value = false;
    ElMessage.error('建立SSE连接失败');
  }
};

// 生成路网缩略图
const generateRoadNetworkThumbnail = () => {
  if (!mapInfo.value || !sim_pixi) return;
  
  try {
    // 参考SimSteps/js/sim.js的generate_thumbnail函数
    const road_data = mapInfo.value;
    // 从地图数据中获取车道数，与SimPIView.vue保持一致
    const lane_num = road_data['Link'][0]['Lane_Number'];
    
    // 手动计算与generate_thumbnail函数完全相同的坐标参数
    const xarray = [];
    const yarray = [];
    const baseline = road_data['Baseline'] || road_data.Baseline;
    if (baseline && Array.isArray(baseline)) {
      for (const b of baseline) {
        const points = b.Points.replace(/,$/, '').split(/,| /);
        for (let i = 0; i < points.length; i += 2) {
          if (i + 1 < points.length) {
            xarray.push(parseInt(points[i]));
            yarray.push(parseInt(points[i + 1]));
          }
        }
      }
    }
    
    // 计算min_x, min_y, max_x, max_y
    const min_x = Math.min.apply(null, xarray);
    const min_y = Math.min.apply(null, yarray);
    const max_x = Math.max.apply(null, xarray);
    const max_y = Math.max.apply(null, yarray);
    
    // 与generate_thumbnail函数完全相同的padding计算
    let extra_x = 100;
    let extra_y = 100;
    if ((extra_x % 2) != 0) extra_x += 1;
    if ((extra_y % 2) != 0) extra_y += 1;
    const padding_x = extra_x / 2;
    const padding_y = extra_y / 2;
    
    console.log('计算的坐标参数:', {
      min_x,
      min_y,
      max_x,
      max_y,
      padding_x,
      padding_y
    });
    
    // 使用generate_thumbnail函数生成不同显示模式的背景图片
    bg_pics.none = generate_thumbnail(road_data, lane_num, false, false);
    bg_pics.withRoadNume = generate_thumbnail(road_data, lane_num, true, false);
    bg_pics.withCrossNume = generate_thumbnail(road_data, lane_num, false, true);
    bg_pics.withAll = generate_thumbnail(road_data, lane_num, true, true);
    
    // 设置初始显示模式
    let bg_pic = bg_pics.none;
    if (showRoadNumbers.value && showCrossNumbers.value) {
      bg_pic = bg_pics.withAll;
    } else if (showRoadNumbers.value) {
      bg_pic = bg_pics.withRoadNume;
    } else if (showCrossNumbers.value) {
      bg_pic = bg_pics.withCrossNume;
    }
    
    // 直接使用手动计算的坐标参数，确保与generate_thumbnail完全一致
    sim_pixi.setRoadNetworkBg(bg_pic, min_x, min_y, max_x, max_y, padding_x, padding_y);
    
    // 重置路网位置，确保居中显示
    sim_pixi.resetBgPos();
    
  } catch (error) {
    console.error('生成路网缩略图失败:', error);
    throw error;
  }
};



// 获取token的函数
const getToken = () => {
  const token = localStorage.getItem('traffic_sim_token');
  if (!token) {
    throw new Error('未找到token，无法发起请求');
  }
  return token;
};

// 发送控制请求
const sendControlRequest = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    // 获取token
    const token = getToken();
    
    // 使用正确的后端URL
    const baseUrl = `http://192.168.1.212:3822`;
    const url = new URL(`${baseUrl}/replay/control/${sessionId.value}/${endpoint}`);
    
    // 添加查询参数
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value.toString());
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    // 处理401未授权错误
    if (response.status === 401) {
      localStorage.removeItem('traffic_sim_token');
      localStorage.removeItem('traffic_sim_user_info');
      ElMessage.error('登录已过期，请重新登录');
      window.location.href = '/login';
      throw new Error('登录已过期');
    }
    
    const result = await response.json();
    if (result.res !== 'ERR_OK') {
      throw new Error(result.msg || '控制请求失败');
    }
    
    return result;
  } catch (error) {
    console.error('发送控制请求失败:', error);
    throw error;
  }
};

// 切换播放/暂停
const togglePlay = async () => {
  if (isPlaying.value) {
    await pause();
  } else {
    await play();
  }
};

// 播放
const play = async () => {
  if (!isMapLoaded.value) {
    ElMessage.warning('地图未加载完成');
    return;
  }
  
  try {
    await sendControlRequest('play');
    isPlaying.value = true;
    console.log('播放请求已发送');
  } catch (error) {
    console.error('播放请求失败:', error);
    ElMessage.error('播放请求失败');
  }
};

// 暂停
const pause = async () => {
  try {
    await sendControlRequest('pause');
    isPlaying.value = false;
    console.log('暂停请求已发送');
  } catch (error) {
    console.error('暂停请求失败:', error);
    ElMessage.error('暂停请求失败');
  }
};

// 停止
const stop = async () => {
  try {
    await sendControlRequest('stop');
    isPlaying.value = false;
    console.log('停止请求已发送');
  } catch (error) {
    console.error('停止请求失败:', error);
    ElMessage.error('停止请求失败');
  }
};

// 重置回放
const resetPlayback = async () => {
  try {
    await stop();
    currentStep.value = 0;
    // 重置画布
    if (sim_pixi) {
      sim_pixi.clearCanvas();
    }
    ElMessage.success('已重置回放');
  } catch (error) {
    console.error('重置回放失败:', error);
    ElMessage.error('重置回放失败');
  }
};

// 步数变化
const onStepChange = async (value: number) => {
  try {
    await sendControlRequest('seek', { targetStep: value });
    console.log('跳转请求已发送');
  } catch (error) {
    console.error('跳转请求失败:', error);
    ElMessage.error('跳转请求失败');
  }
};

// 速度变化
const onSpeedChange = async (value: number) => {
  try {
    await sendControlRequest('speed', { speed: value });
    console.log('速度调整请求已发送');
  } catch (error) {
    console.error('速度调整请求失败:', error);
    ElMessage.error('速度调整请求失败');
  }
};

// 更新回放帧 - 确保时间戳与位置更新的一致性
const updatePlaybackFrame = (stepData: any) => {
  if (!sim_pixi || !isMapLoaded.value) return;
  
  try {
    // 确保时间轴同步，先更新当前步数
    currentStep.value = stepData.step;
    
    // 处理simData中的数据
    const simData = stepData.simData;
    if (simData) {
      // 处理信号灯数据
      if (simData.signals && Array.isArray(simData.signals)) {
        for (const signal of simData.signals) {
          // 添加路口
          if (!sim_pixi.getCross(signal.cross_id)) {
            sim_pixi.addCross(signal.cross_id);
          }
          
          // 添加或更新信号灯相位
          if (signal.phases && Array.isArray(signal.phases)) {
            for (const phase of signal.phases) {
              // 检查相位是否已存在，存在则更新，不存在则添加
              // 注：SimPIXI目前没有getPhase方法，暂时先清除所有相位再重新添加
              // TODO: 实现更高效的相位更新逻辑
              sim_pixi.addPhaseToCross(signal.cross_id, phase.id, phase.color, phase.x, phase.y);
              sim_pixi.updatePhaseColor(signal.cross_id, phase.id, phase.color);
            }
          }
        }
      }
      
      // 处理车辆数据 - 优化：只更新现有车辆，不清除所有
      if (simData.vehicles && Array.isArray(simData.vehicles)) {
        // 记录当前存在的车辆ID
        const currentVehIds = new Set<number>();
        
        for (const veh of simData.vehicles) {
          // 添加到当前车辆ID集合
          currentVehIds.add(veh.id);
          
          // 解析路由
          let routerArray: number[] = [];
          if (veh.router) {
            // 路由可能是字符串格式，如"3 13 19 23"，需要转换为数组
            routerArray = veh.router.split(/\s+/).map(Number);
          }
          
          // 使用正确的lane_id（处理两种格式：lane_id和laneId）
          const laneId = veh.lane_id !== undefined ? veh.lane_id : veh.laneId;
          
          // 检查车辆是否已存在，存在则更新，不存在则添加
          if (sim_pixi.getVeh(veh.id)) {
            // 更新车辆位置 - 使用与地图背景一致的坐标转换
            sim_pixi.moveVeh(veh.id, veh.x, veh.y);
            // 更新车辆速度
            sim_pixi.updateVehAttr(veh.id, 'CurSpd', veh.cur_spd || veh.speed);
            sim_pixi.updateVehAttr(veh.id, 'LastSpd', veh.last_spd || 0);
          } else {
            // 添加新车辆 - 使用与地图背景一致的坐标转换
            sim_pixi.addVeh(
              veh.id,
              veh.in_cross || false,
              veh.link_id,
              laneId,
              veh.cell_id,
              veh.x,
              veh.y,
              veh.speed,
              routerArray
            );
            
            // 计算并设置车辆角度 - 只在创建车辆时计算一次，避免每帧重新计算
            if (mapInfo.value) {
              const map_data = mapInfo.value;
              if (map_data.Link && Array.isArray(map_data.Link)) {
                const LinkInfo = map_data.Link.find((link: any) => link.Object_ID === veh.link_id);
                if (LinkInfo) {
                  // 根据LinkID拿到车辆所在的PathID
                  const PathID = LinkInfo.Path_ID;
                  if (PathID !== undefined && map_data.Baseline && Array.isArray(map_data.Baseline)) {
                    // 通过PathID拿到baseline的坐标
                    const PathInfo = map_data.Baseline.find((path: any) => path.Path_ID === PathID);
                    if (PathInfo && PathInfo.Points) {
                      const coordinates = PathInfo.Points.split(',')
                        .filter((coord: string) => coord.trim() !== '')
                        .map((coord: string) => coord.split(' ').map(Number));
                      
                      if (coordinates.length == 2) { // 正常都是两个坐标
                        const y_diff = (coordinates[1][1] - coordinates[0][1]); // (y2 - y1)
                        const x_diff = (coordinates[1][0] - coordinates[0][0]); // (x2 - x1)
                        
                        if (y_diff == 0) {
                          ; // 水平的不用管 车辆图片生成的时候就是水平的
                        } else if (x_diff == 0) {
                          // 90度 = (π/180)*90弧度 = π/2
                          sim_pixi.rotateVeh(veh.id, Math.PI/2);
                        } else {
                          // 直接计算弧度
                          const angle = Math.atan2(y_diff, x_diff);
                          sim_pixi.rotateVeh(veh.id, angle);
                        }
                      }
                    }
                  } else if (LinkInfo.Baseline && LinkInfo.Baseline.Points) {
                    // 兼容旧格式，直接从LinkInfo获取Baseline
                    const points = LinkInfo.Baseline.Points.split(',').filter((p: string) => p.trim() !== '');
                    if (points.length >= 2) {
                      // 获取第一个和最后一个点
                      const firstPoint = points[0].split(' ').map(Number);
                      const lastPoint = points[points.length - 1].split(' ').map(Number);
                      
                      // 计算角度
                      const y_diff = lastPoint[1] - firstPoint[1];
                      const x_diff = lastPoint[0] - firstPoint[0];
                      const angle = Math.atan2(y_diff, x_diff);
                      sim_pixi.rotateVeh(veh.id, angle);
                    }
                  }
                }
              }
            }
          }
          
          // 更新车辆的in_cross状态和相关属性
          const isInCross = veh.in_cross || false;
          sim_pixi.updateVehAttr(veh.id, 'InCross', isInCross);
          
          if (isInCross) {
            sim_pixi.updateVehAttr(veh.id, 'CrossId', veh.cross_id || -1);
            sim_pixi.updateVehAttr(veh.id, 'CrossLaneId', laneId);
            sim_pixi.updateVehAttr(veh.id, 'CrossCellId', veh.cell_id);
            sim_pixi.updateVehAttr(veh.id, 'LinkId', -1);
            sim_pixi.updateVehAttr(veh.id, 'LaneId', -1);
            sim_pixi.updateVehAttr(veh.id, 'CellId', -1);
          } else {
            sim_pixi.updateVehAttr(veh.id, 'LinkId', veh.link_id);
            sim_pixi.updateVehAttr(veh.id, 'LaneId', laneId);
            sim_pixi.updateVehAttr(veh.id, 'CellId', veh.cell_id);
            sim_pixi.updateVehAttr(veh.id, 'CrossId', -1);
            sim_pixi.updateVehAttr(veh.id, 'CrossLaneId', -1);
            sim_pixi.updateVehAttr(veh.id, 'CrossCellId', -1);
          }
          
          // 更新车辆位置属性，确保与显示位置一致
          sim_pixi.updateVehAttr(veh.id, 'X', veh.x);
          sim_pixi.updateVehAttr(veh.id, 'Y', veh.y);
        }
        
        // 删除不再存在的车辆
        // 注：SimPIXI目前没有getAllVehIds方法，暂时先保留所有车辆
        // TODO: 实现更高效的车辆清理逻辑
      }
    }
    
  } catch (error) {
    console.error('更新回放帧失败:', error);
    ElMessage.error('更新回放帧失败');
  }
};

// 重置地图位置
const resetMapPosition = () => {
  if (sim_pixi) {
    sim_pixi.resetBgPos();
    ElMessage.success('已重置路网位置');
  }
};

// 显示控制变化处理
const onShowControlChange = () => {
  if (!sim_pixi) return;
  
  // 根据当前显示选项选择合适的背景图片
  let bg_pic = bg_pics.none;
  if (showRoadNumbers.value && showCrossNumbers.value) {
    bg_pic = bg_pics.withAll;
  } else if (showRoadNumbers.value) {
    bg_pic = bg_pics.withRoadNume;
  } else if (showCrossNumbers.value) {
    bg_pic = bg_pics.withCrossNume;
  }
  
  // 设置新的背景图片
  sim_pixi.setRoadNetworkBg(bg_pic);
};

// 生命周期钩子
onMounted(() => {
  // 初始化地图
  initMap();
  
  // 添加窗口大小变化事件监听
  window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
  // 清理资源
  cleanup();
  
  // 移除窗口大小变化事件监听
  window.removeEventListener('resize', handleWindowResize);
});

// 处理窗口大小变化
const handleWindowResize = () => {
  if (sim_pixi) {
    const canvas = document.getElementById('replay_pixi') as HTMLCanvasElement;
    if (canvas) {
      // 获取canvas的实际尺寸（考虑CSS缩放）
      const rect = canvas.getBoundingClientRect();
      sim_pixi.resizeCanvas(rect.width, rect.height);
    }
  }
};
</script>

<style scoped>
.sim-replay-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.replay-header {
  margin-bottom: 20px;
  background-color: white;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.replay-content {
  display: flex;
  gap: 20px;
}

.map-container {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

#replay_pixi {
  display: block;
  width: 100%;
  height: auto;
}

.control-panel {
  width: 350px;
}

.card-header {
  font-weight: bold;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.control-buttons .el-button {
  flex: 1;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.speed-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.display-options {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.option-item {
  margin-bottom: 10px;
}

.option-item:last-child {
  margin-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .replay-content {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
  }
  
  .map-container {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .sim-replay-container {
    padding: 10px;
  }
  
  .map-container {
    height: 400px;
  }
}
</style>
