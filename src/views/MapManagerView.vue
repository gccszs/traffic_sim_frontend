<template>
  <div class="map-manager-container">
    <h2 class="page-title">地图管理</h2>
    <el-row class="filter-row">
      <el-col :span="8">
        <el-input 
          v-model="searchQuery" 
          placeholder="地图名称" 
          prefix-icon="Search" 
          size="large"
          @keyup.enter="getMaps"
        />
      </el-col>
      <el-col :span="4">
        <el-button type="primary" size="large" @click="getMaps">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
      </el-col>
      <el-col :span="4" offset="8">
        <el-button type="success" size="large" @click="handleAddMap">
          <el-icon><Plus /></el-icon> 上传地图
        </el-button>
      </el-col>
    </el-row>

    <el-card class="map-list-card" shadow="hover" v-if="maps.length > 0">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="map in maps" :key="map.id">
          <el-card :body-style="{ padding: '0px' }" class="map-item">
            <img :src="map.imageUrl || '/favicon.ico'" class="map-image" alt="地图缩略图" />
            <div class="map-info">
              <h3 class="map-name">{{ map.name }}</h3>
              <p class="map-description">{{ map.description }}</p>
              <div class="map-actions">
                <el-button type="primary" size="small" @click="handleViewMap(map)">
                  <el-icon><View /></el-icon> 查看
                </el-button>
                <el-button type="warning" size="small" @click="handleEditMap(map)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteMap(map)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="total"
          :current-page.sync="page"
          :page-size.sync="pageSize"
          @current-change="getMaps"
        />
      </div>
    </el-card>

    <el-empty description="暂无地图数据" v-else>
      <el-button type="primary" @click="handleAddMap">
        <el-icon><Plus /></el-icon> 上传地图
      </el-button>
    </el-empty>

    <!-- 地图上传弹窗 -->
    <el-dialog
      title="上传地图"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="mapForm" :rules="mapRules" ref="mapFormRef" label-width="100px">
        <el-form-item label="地图名称" prop="name">
          <el-input v-model="mapForm.name" placeholder="请输入地图名称" />
        </el-form-item>
        <el-form-item label="地图描述" prop="description">
          <el-input 
            v-model="mapForm.description" 
            type="textarea" 
            placeholder="请输入地图描述" 
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="地图文件" prop="file">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :file-list="fileList"
            :auto-upload="false"
            ref="uploadRef"
            accept=".json,.xml"
          >
            <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
            <el-button style="margin-left: 10px;" size="small" @click="submitUpload">上传到服务器</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMap">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, View, Edit, Delete } from '@element-plus/icons-vue';
import { getMaps as getMapsApi, deleteMap, uploadMap } from '@/apis/MapApi';

// 定义地图项类型
interface MapItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  filePath: string;
  createTime: string;
  updateTime: string;
}

const searchQuery = ref('');
const maps = ref<MapItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(12);
const dialogVisible = ref(false);
const mapFormRef = ref();
const uploadRef = ref();
const fileList = ref([]);
const uploadUrl = '/maps/upload';

// 上传请求头配置
const uploadHeaders = ref({});

// 从localStorage获取token并设置请求头
onMounted(() => {
  const token = localStorage.getItem('traffic_sim_token');
  if (token) {
    uploadHeaders.value = {
      'Authorization': `Bearer ${token}`
    };
  }
});

const mapForm = reactive({
  id: '',
  name: '',
  description: '',
  file: null,
  imageUrl: ''
});

const mapRules = {
  name: [
    { required: true, message: '请输入地图名称', trigger: 'blur' },
    { min: 2, max: 50, message: '地图名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: false, message: '请输入地图描述', trigger: 'blur' },
    { max: 200, message: '地图描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
};

const getMaps = () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    name: searchQuery.value
  };
  getMapsApi(params).then(response => {
    if (response.success && response.data) {
      maps.value = response.data.maps;
      total.value = response.data.total;
    } else {
      ElMessage.error(response.message || '获取地图列表失败');
    }
  }).catch(error => {
    ElMessage.error('获取地图列表失败：' + error.message);
  });
};

const handleAddMap = () => {
  resetForm();
  dialogVisible.value = true;
};

const handleViewMap = (map: MapItem) => {
  // 查看地图详情
  ElMessage.info('查看地图：' + map.name);
};

const handleEditMap = (map: MapItem) => {
  // 编辑地图
  Object.assign(mapForm, map);
  dialogVisible.value = true;
};

const handleDeleteMap = (map: MapItem) => {
  ElMessageBox.confirm(
    `确定要删除地图 "${map.name}" 吗？此操作不可恢复。`,
    '删除地图',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteMap(map.id).then(response => {
      if (response.success) {
        ElMessage.success('删除地图成功');
        getMaps();
      } else {
        ElMessage.error(response.message || '删除地图失败');
      }
    }).catch(error => {
      ElMessage.error('删除地图失败：' + error.message);
    });
  }).catch(() => {
    // 取消删除
  });
};

const submitUpload = () => {
  uploadRef.value.submit();
};

const handleUploadSuccess = (response: any, file: any, fileList: any[]) => {
  if (response.success) {
    mapForm.file = response.data?.filePath;
    mapForm.imageUrl = response.data?.imageUrl;
    ElMessage.success('文件上传成功');
  } else {
    ElMessage.error(response.message || '文件上传失败');
  }
};

const handleUploadError = (error: any) => {
  ElMessage.error('文件上传失败：' + error.message);
};

const saveMap = () => {
  mapFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      // 保存地图信息
      ElMessage.success('地图保存成功');
      dialogVisible.value = false;
      getMaps();
    } else {
      return false;
    }
  });
};

const resetForm = () => {
  mapForm.id = '';
  mapForm.name = '';
  mapForm.description = '';
  mapForm.file = null;
  mapForm.imageUrl = '';
  fileList.value = [];
  if (mapFormRef.value) {
    mapFormRef.value.resetFields();
  }
};

onMounted(() => {
  getMaps();
});
</script>

<style scoped>
.map-manager-container {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.filter-row {
  margin-bottom: 20px;
}

.map-list-card {
  margin-top: 20px;
}

.map-item {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.map-item:hover {
  transform: translateY(-5px);
}

.map-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.map-info {
  padding: 15px;
}

.map-name {
  font-size: 16px;
  margin-bottom: 8px;
  color: #303133;
}

.map-description {
  font-size: 14px;
  margin-bottom: 15px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}

.map-actions {
  display: flex;
  justify-content: space-between;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>