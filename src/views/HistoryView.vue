<template>
  <el-row>
    内测版本ID: 2025.2ddad09b-ce0c-8d0f-c027-b527e3f94f37.6.12
  </el-row>

  <el-row justify="center">
    <el-col :span="6">
      <el-statistic :value="138">
        <template #title>
          <div style="display: inline-flex; align-items: center">
            总仿真次数
            <el-icon style="margin-left: 4px" :size="12">
              <DocumentChecked />
            </el-icon>
          </div>
        </template>
      </el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic :value="268514">
        <template #title>
          <div style="display: inline-flex; align-items: center">
            总仿真步数
            <el-icon style="margin-left: 4px" :size="12">
              <Position />
            </el-icon>
          </div>
        </template>
      </el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic :value="outputValue">
        <template #title>
          <div style="display: inline-flex; align-items: center">
            总仿真时长
            <el-icon style="margin-left: 4px" :size="12">
              <Clock />
            </el-icon>
          </div>
        </template>
      </el-statistic>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTransition } from '@vueuse/core'
import { DocumentChecked, Clock, Position, Timer } from '@element-plus/icons-vue'

const source = ref(0);
const outputValue = useTransition(source, {
  duration: 1500,
});
source.value = 172054;

</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
