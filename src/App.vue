<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, computed, onMounted } from "vue";
import AsideMenu from "@/components/AsideMenu.vue";
import MainHeader from "@/components/MainHeader.vue";
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const userInfo = computed(() => authStore.userInfo);

// 应用启动时初始化auth状态
onMounted(() => {
  if (import.meta.env.DEV) {
    // 开发环境下初始化auth状态
    authStore.initDevState();
  }
});
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100%;">
      <el-header style="padding: 0; margin: 0 0 2px;">
        <MainHeader />
      </el-header>
      <el-container style="height: 100%;">
        <el-aside width="auto" v-if="isLoggedIn">
          <AsideMenu />
        </el-aside>
        <el-main>
          <RouterView> </RouterView>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

html,body,#app{
  width: 100% !important;
  height: 100% !important;
}
</style>
