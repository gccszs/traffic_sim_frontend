<template>
  <div class="user-manager-container">
    <h2 class="page-title">用户管理</h2>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>
      <div class="placeholder-content">
        <el-empty description="用户管理功能开发中" :image-size="120" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
// 用户管理页面占位组件
// 后续可以扩展用户列表、添加用户、编辑用户、删除用户等功能
</script>

<style scoped>
.user-manager-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.placeholder-content {
  padding: 40px 0;
  text-align: center;
}
</style>