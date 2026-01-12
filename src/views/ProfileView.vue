<template>
  <div class="profile-container">
    <h2 class="page-title">个人中心</h2>
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户信息</span>
        </div>
      </template>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="error" class="error-container">
        <el-alert type="error" :title="error" show-icon />
        <el-button type="primary" size="small" @click="fetchUserProfile">重新获取</el-button>
      </div>
      <div v-else-if="userProfile" class="profile-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ userProfile.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userProfile.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userProfile.phoneNumber }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ userProfile.institution }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ userProfile.roleName }}</el-descriptions-item>
          <el-descriptions-item label="角色ID">{{ userProfile.roleId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ userProfile.id }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" v-if="userProfile.createdAt">{{ formatDate(userProfile.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" v-if="userProfile.updatedAt">{{ formatDate(userProfile.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getUserProfile } from '@/apis/AuthApi';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const loading = ref(false);
const error = ref<string | null>(null);
const userProfile = ref<any>(null);

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 获取用户个人数据
const fetchUserProfile = async () => {
  if (!authStore.userInfo?.id) {
    error.value = '无法获取用户ID';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getUserProfile(authStore.userInfo.id);
    if (response.success && response.data) {
      userProfile.value = response.data;
    } else {
      const errorMsg = response.msg || '获取用户信息失败';
      error.value = errorMsg;
      ElMessage.error(errorMsg);
    }
  } catch (err: any) {
    const errorMsg = err.message || '获取用户信息失败';
    error.value = errorMsg;
    ElMessage.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取用户信息
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.loading-container {
  padding: 20px 0;
}

.error-container {
  padding: 20px 0;
}

.error-container .el-button {
  margin-top: 10px;
}

.profile-content {
  padding: 10px 0;
}

.profile-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

.profile-content :deep(.el-descriptions__content) {
  color: #303133;
}
</style>