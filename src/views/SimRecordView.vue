<template>
  <div class="sim-record-manager-container">
    <h2 class="page-title">仿真记录管理</h2>
    
    <!-- 搜索筛选区域 -->
    <el-row class="filter-row">
      <el-col :span="8">
        <el-input 
          v-model="searchQuery" 
          placeholder="记录名称/描述" 
          prefix-icon="Search" 
          size="large"
          @keyup.enter="fetchRecords"
        />
      </el-col>
      <el-col :span="6">
        <el-select
          v-model="statusFilter"
          placeholder="选择状态"
          size="large"
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option label="完成" value="completed" />
          <el-option label="进行中" value="running" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" size="large" @click="fetchRecords">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
      </el-col>
      <el-col :span="4" offset="2">
        <el-button type="warning" size="large" @click="resetFilters">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </el-col>
    </el-row>

    <!-- 加载状态 -->
    <el-skeleton :rows="3" animated v-if="loading" />
    
    <!-- 仿真记录列表 -->
    <el-card class="record-list-card" shadow="hover" v-else-if="records.length > 0">
      <el-table 
        v-loading="tableLoading" 
        :data="records" 
        style="width: 100%" 
        stripe
        border
        highlight-current-row
      >
        <el-table-column prop="name" label="仿真名称" min-width="180" />
        <el-table-column prop="map_name" label="地图名称" min-width="180" />
        <el-table-column prop="create_time" label="仿真时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewDetail(scope.row)"
              title="查看详情"
            >
              <el-icon><View /></el-icon>
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="handleEditRecord(scope.row)"
              title="编辑"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDeleteRecord(scope.row)"
              title="删除"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-empty description="暂无仿真记录数据" v-else>
      <el-button type="primary" @click="fetchRecords">
        <el-icon><Refresh /></el-icon> 刷新数据
      </el-button>
    </el-empty>

    <!-- 详情对话框 -->
    <el-dialog
      title="仿真记录详情"
      v-model="detailDialogVisible"
      width="800px"
      @close="resetDetailForm"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录ID">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="仿真名称">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="地图名称">{{ detailForm.map_name }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="getStatusType(detailForm.status)">{{ detailForm.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="仿真时间">{{ detailForm.create_time }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailForm.update_time }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ detailForm.user_name }}</el-descriptions-item>
        <el-descriptions-item label="时长(秒)">{{ detailForm.duration }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailForm.description }}</el-descriptions-item>
        <el-descriptions-item label="详细信息" :span="2">
          <el-input
            v-model="detailForm.detail_info"
            type="textarea"
            :rows="5"
            readonly
            style="background-color: #f5f7fa"
          />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑仿真记录"
      v-model="editDialogVisible"
      width="500px"
      @close="resetEditForm"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="仿真名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入仿真名称" />
        </el-form-item>
        <el-form-item label="地图名称" prop="map_name">
          <el-input v-model="editForm.map_name" placeholder="请输入地图名称" />
        </el-form-item>
        <el-form-item label="记录描述" prop="description">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            placeholder="请输入记录描述" 
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="完成" value="completed" />
            <el-option label="进行中" value="running" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue';
import { getSimRecords } from '@/apis/SimRecordApi';
import type { SimRecord as ApiSimRecord } from '@/apis/SimRecordApi';

// 使用API中定义的仿真记录类型
type SimRecord = ApiSimRecord;

// 定义状态类型映射
const statusTypeMap = {
  completed: 'success',
  running: 'warning',
  failed: 'danger'
};

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  return statusTypeMap[status as keyof typeof statusTypeMap] || 'info';
};

// 响应式数据
const loading = ref(true);
const tableLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const total = ref(0);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 仿真记录列表
const records = ref<SimRecord[]>([]);

// 详情对话框
const detailDialogVisible = ref(false);
const detailForm = ref<SimRecord>({
  id: 0,
  name: '',
  map_name: '',
  description: '',
  status: '',
  create_time: '',
  update_time: '',
  user_name: '',
  duration: 0,
  detail_info: ''
});

// 编辑对话框
const editDialogVisible = ref(false);
const editFormRef = ref();
const editForm = reactive({
  id: 0,
  name: '',
  map_name: '',
  description: '',
  status: 'completed'
});

// 编辑表单验证规则
const editRules = reactive({
  name: [
    { required: true, message: '请输入仿真名称', trigger: 'blur' },
    { min: 2, max: 50, message: '仿真名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  map_name: [
    { required: true, message: '请输入地图名称', trigger: 'blur' },
    { min: 2, max: 50, message: '地图名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
})

// 获取仿真记录列表
const fetchRecords = async () => {
  tableLoading.value = true;
  
  try {
    // 调用API获取数据
    const response = await getSimRecords({
      page: pagination.currentPage,
      size: pagination.pageSize,
      keyword: searchQuery.value || undefined,
      status: statusFilter.value || undefined
    });
    
    if (response.success && response.data) {
      // 更新记录列表
      records.value = response.data.records;
      // 更新总条数
      total.value = response.data.total;
      // 更新分页信息
      pagination.currentPage = response.data.current;
      pagination.pageSize = response.data.size;
      
      ElMessage.success('获取仿真记录成功');
    } else {
      // 处理API返回失败情况
      ElMessage.error(response.msg || '获取仿真记录失败');
      records.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取仿真记录失败:', error);
    ElMessage.error('网络错误，请检查网络连接后重试');
    records.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
    tableLoading.value = false;
  }
};

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  pagination.currentPage = 1;
  fetchRecords();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchRecords();
};

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current;
  fetchRecords();
};

// 查看详情
const handleViewDetail = (record: SimRecord) => {
  detailForm.value = { ...record };
  detailDialogVisible.value = true;
};

// 重置详情表单
const resetDetailForm = () => {
  detailForm.value = {
    id: 0,
    name: '',
    map_name: '',
    description: '',
    status: '',
    create_time: '',
    update_time: '',
    user_name: '',
    duration: 0,
    detail_info: ''
  };
};

// 编辑记录
const handleEditRecord = (record: SimRecord) => {
  editForm.id = record.id;
  editForm.name = record.name;
  editForm.map_name = record.map_name;
  editForm.description = record.description;
  editForm.status = record.status;
  editDialogVisible.value = true;
};

// 重置编辑表单
const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  editForm.id = 0;
  editForm.name = '';
  editForm.map_name = '';
  editForm.description = '';
  editForm.status = 'completed';
};

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return;
  
  try {
    await editFormRef.value.validate();
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 实际项目中应使用API请求
    // await api.updateSimRecord(editForm);
    
    // 更新本地数据
    const index = records.value.findIndex(record => record.id === editForm.id);
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        update_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
    }
    
    ElMessage.success('编辑仿真记录成功');
    editDialogVisible.value = false;
  } catch (error: any) {
    if (error?.message) {
      ElMessage.error(error.message);
    } else {
      console.error('编辑仿真记录失败:', error);
      ElMessage.error('编辑仿真记录失败，请稍后重试');
    }
  }
};

// 删除记录
const handleDeleteRecord = (record: SimRecord) => {
  ElMessageBox.confirm(
    `确定要删除仿真记录 "${record.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 实际项目中应使用API请求
        // await api.deleteSimRecord(record.id);
        
        // 更新本地数据
        records.value = records.value.filter(r => r.id !== record.id);
        total.value--;
        
        ElMessage.success('删除仿真记录成功');
      } catch (error) {
        console.error('删除仿真记录失败:', error);
        ElMessage.error('删除仿真记录失败，请稍后重试');
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 页面挂载时获取数据
onMounted(() => {
  fetchRecords();
});
</script>

<style scoped>
.sim-record-manager-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.filter-row {
  margin-bottom: 20px;
}

.record-list-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sim-record-manager-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}
</style>