<template>
  <div class="header">
    <div class="header-left">
      <img src="/favicon.ico" height="30" style="margin: 0 5px;">
      <p class="header-title">微观交通仿真系统 Version:PI</p>
    </div>
    <div class="header-right" v-if="isLoggedIn">
      <el-dropdown @command="handleCommand" trigger="click">
        <span class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ userInfo?.username || '' }}</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { User, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const userInfo = computed(() => authStore.userInfo);

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await authStore.logout();
    ElMessage.success('退出登录成功');
    router.push('/login');
  } else if (command === 'profile') {
    // 跳转到个人中心（如果有）
    ElMessage.info('个人中心功能开发中');
  }
};
</script>

<style>
.header {
  background-color: #0164ca;
  height: 100%;
  display: flex;
  line-height: 50px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  height: 50px;
  width: auto;
  font-size: 20px;
  text-align: center;
  color: white;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-info .el-icon {
  margin-right: 5px;
}
</style>
