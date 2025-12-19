<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

import { ref } from "vue";
import AsideMenu from "@/components/AsideMenu.vue";
import MainHeader from "@/components/MainHeader.vue";

</script>

<template>
    <div class="common-layout">
      <el-container style="height: 100%;">
        <el-header style="padding: 0; margin: 0 0 2px;">
            <MainHeader />
        </el-header>
        <el-container style="height: 100%;">
          <el-aside width="auto">
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
