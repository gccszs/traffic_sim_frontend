<template>
  <el-menu
    :router="true"
    default-active="/"
    class="el-menu-vertical-demo"
    :collapse="foldAside"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-menu-item @click="() => {foldAside = !(foldAside);}">
      <el-icon v-if="foldAside"><Expand /></el-icon>
      <el-icon v-else><Fold /></el-icon>
      <template #title>折叠菜单</template>
    </el-menu-item>
    <el-sub-menu index="2">
      <template #title>
        <el-icon><icon-menu /></el-icon>
        <span>创建仿真</span>
      </template>
      <el-menu-item index="2-1">普通仿真</el-menu-item>
      <el-menu-item index="/simpisetup">交互仿真</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/">
      <el-icon><histogram /></el-icon>
      <template #title>历史数据</template>
    </el-menu-item>
    <el-menu-item index="/mapmanager">
      <el-icon><location /></el-icon>
      <template #title>地图管理</template>
    </el-menu-item>
    <!-- 仅管理员显示用户管理 -->
    <el-menu-item v-if="isAdmin" index="/usermanager">
      <el-icon><UserFilled /></el-icon>
      <template #title>用户管理</template>
    </el-menu-item>
    <el-menu-item index="/setting">
      <el-icon><setting /></el-icon>
      <template #title>全局设置</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Histogram, Menu as IconMenu, Setting, Fold, Expand, Location, UserFilled } from "@element-plus/icons-vue";
import { useAuthStore } from '@/stores/auth';

const foldAside = ref(false);
const authStore = useAuthStore();
const userInfo = computed(() => authStore.userInfo);

// 检查是否为管理员（roleId为1）
const isAdmin = computed(() => userInfo.value?.roleId === 1);

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};

onMounted(() => {

})

</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: auto;
  min-height: 400px;
}

.aside-title {
  background-color: #0164ca;
  height: 50px;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 0;
}
</style>
