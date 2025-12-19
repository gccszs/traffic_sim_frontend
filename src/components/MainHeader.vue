<template>
  <div class="header">
    <img src="/favicon.ico" height="30" style="margin: 0 5px;">
    <p class="header-title">微观交通仿真系统 Version:PI</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

</script>

<style>
.header {
  background-color: #0164ca;
  height: 100%;
  display: flex;
  
  line-height: 50px;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}

.header-title {
  height: 50px;
  width: auto;
  float: left;
  font-size: 20px;
  text-align: center;
  color: white;
}
</style>
