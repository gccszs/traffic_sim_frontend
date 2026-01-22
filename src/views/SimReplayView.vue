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
            <el-select v-model="playbackSpeed" style="width: 120px; margin-left: 10px;">
              <el-option label="0.5x" :value="0.5" />
              <el-option label="1x" :value="1" />
              <el-option label="2x" :value="2" />
              <el-option label="4x" :value="4" />
            </el-select>
          </div>

          <!-- 显示选项 -->
          <div class="display-options">
            <div class="option-item">
              <el-switch v-model="showRoadNumbers" active-text="道路标号" />
            </div>
            <div class="option-item">
              <el-switch v-model="showCrossNumbers" active-text="路口标号" />
            </div>
            <div class="option-item">
              <el-button color="#626aef" @click="resetMapPosition">重置路网位置</el-button>
            </div>
          </div>
        </el-card>

        <!-- 地图信息卡片 -->
        <el-card shadow="hover" style="margin-top: 15px;">
          <template #header>
            <div class="card-header">
              <span>地图信息</span>
            </div>
          </template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="地图名称">{{ mapInfo?.map_name || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="Link数量">{{ mapInfo?.link_count || 0 }}</el-descriptions-item>
            <el-descriptions-item label="Cross数量">{{ mapInfo?.cross_count || 0 }}</el-descriptions-item>
            <el-descriptions-item label="总步数">{{ totalSteps }}</el-descriptions-item>
          </el-descriptions>
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
    
    // 设置taskId
    taskId.value = storedTaskId;
    
    // 解析地图数据
    mapInfo.value = JSON.parse(mapInfoStr);
    
    // 初始化PIXI画布
    const canvas = document.getElementById('replay_pixi') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('找不到画布元素');
    }
    
    sim_pixi = new SimPIXI(canvas.width, canvas.height);
    
    // 绘制路网 - 参考SimPIView.vue的实现
    drawRoadNetwork();
    
    // 标记地图已加载
    isMapLoaded.value = true;
    isLoading.value = false;
    
    ElMessage.success('地图加载成功');
  } catch (error: any) {
    console.error('初始化地图失败:', error);
    ElMessage.error(error.message || '初始化地图失败');
    isLoading.value = false;
  }
};

// 绘制路网 - 参考SimPIView.vue的实现逻辑
const drawRoadNetwork = () => {
  if (!sim_pixi || !mapInfo.value) return;
  
  try {
    // 提取地图数据
    const mapData = mapInfo.value;
    
    // 绘制Link (道路)
    if (mapData.Link && Array.isArray(mapData.Link)) {
      for (const link of mapData.Link) {
        // 绘制道路中心线
        const baseline = link.Baseline;
        if (baseline && baseline.Points) {
          const points = baseline.Points.split(',').filter((p: string) => p.trim() !== '');
          if (points.length >= 4) {
            // 将点字符串转换为坐标数组
            const coordinates = points.map((p: string) => {
              const coords = p.split(' ').map(Number);
              return { x: coords[0], y: coords[1] };
            });
            
            // 绘制道路
            sim_pixi?.drawRoads(coordinates, link.Road_ID);
          }
        }
      }
    }
    
    // 绘制Cross (路口)
    if (mapData.Cross && Array.isArray(mapData.Cross)) {
      for (const cross of mapData.Cross) {
        // 获取路口位置
        const crossX = cross.X || 0;
        const crossY = cross.Y || 0;
        
        // 绘制路口
        sim_pixi?.addCross(cross.Object_ID);
      }
    }
    
    // 绘制完成后刷新画布
    sim_pixi?.refreshCanvas();
    
  } catch (error) {
    console.error('绘制路网失败:', error);
    throw error;
  }
};

// 切换播放/暂停
const togglePlay = () => {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
};

// 播放
const play = () => {
  if (!isMapLoaded.value || replayData.value.length === 0) {
    ElMessage.warning('没有可播放的数据');
    return;
  }
  
  isPlaying.value = true;
  
  // 设置定时器
  const interval = 1000 / playbackSpeed.value; // 根据速度调整间隔
  playbackTimer = window.setInterval(() => {
    if (currentStep.value < totalSteps.value) {
      // 前进到下一步
      currentStep.value++;
      // 更新画布显示
      updatePlaybackFrame();
    } else {
      // 播放完成
      stop();
      ElMessage.success('回放完成');
    }
  }, interval);
};

// 暂停
const pause = () => {
  isPlaying.value = false;
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
};

// 停止
const stop = () => {
  pause();
  currentStep.value = 0;
  updatePlaybackFrame();
};

// 重置回放
const resetPlayback = () => {
  stop();
  currentStep.value = 0;
  updatePlaybackFrame();
  ElMessage.success('已重置回放');
};

// 步数变化
const onStepChange = (value: number) => {
  updatePlaybackFrame();
};

// 更新回放帧
const updatePlaybackFrame = () => {
  if (!sim_pixi || !isMapLoaded.value) return;
  
  try {
    // 清除当前帧的动态元素（如车辆）
    sim_pixi.clearCanvas();
    
    // 重新绘制路网
    drawRoadNetwork();
    
    // 获取当前步的数据
    const currentData = replayData.value[currentStep.value];
    if (currentData) {
      // 绘制车辆
      if (currentData.vehicles && Array.isArray(currentData.vehicles)) {
        for (const veh of currentData.vehicles) {
          sim_pixi?.addVeh(
            veh.id,
            false,
            veh.link_id,
            veh.lane_id,
            veh.cell_id,
            veh.x,
            veh.y,
            veh.speed,
            veh.router || []
          );
        }
      }
      
      // 更新路口信号灯
      if (currentData.controllers && Array.isArray(currentData.controllers)) {
        for (const ctrl of currentData.controllers) {
          sim_pixi?.addCross(ctrl.cross_id);
          if (ctrl.phases && Array.isArray(ctrl.phases)) {
            for (const phase of ctrl.phases) {
              sim_pixi?.addPhaseToCross(ctrl.cross_id, phase.id, phase.color, phase.x, phase.y);
            }
          }
        }
      }
    }
    
    // 刷新画布
    sim_pixi?.refreshCanvas();
    
  } catch (error) {
    console.error('更新回放帧失败:', error);
  }
};

// 重置地图位置
const resetMapPosition = () => {
  if (sim_pixi) {
    sim_pixi.resetBgPos();
    ElMessage.success('已重置路网位置');
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化地图
  initMap();
});

onUnmounted(() => {
  // 清理资源
  cleanup();
});
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
