<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">交通仿真系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="top" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="User" 
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn" 
            @click="handleLogin" 
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loginFormRef = ref();
const loginForm = reactive({
  username: '',
  password: ''
});

const loading = computed(() => authStore.loading);

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const success = await authStore.login(loginForm.username, loginForm.password);
        if (success) {
          ElMessage.success('登录成功');
          router.push('/');
        } else {
          ElMessage.error('登录失败，请检查用户名和密码');
        }
      } catch (error: any) {
        ElMessage.error('登录失败：' + (error.message || '未知错误'));
      }
    } else {
      return false;
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-title {
  text-align: center;
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
}
</style>