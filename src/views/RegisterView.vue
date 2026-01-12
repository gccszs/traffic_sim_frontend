<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">注册账号</h2>
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-position="top" class="register-form">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="User" 
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            size="large"
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            prefix-icon="Lock" 
            size="large"
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱" 
            prefix-icon="Message" 
            size="large"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input 
            v-model="registerForm.phoneNumber" 
            placeholder="请输入手机号" 
            prefix-icon="Phone" 
            size="large"
          />
        </el-form-item>
        <el-form-item label="单位" prop="institution">
          <el-input 
            v-model="registerForm.institution" 
            placeholder="请输入单位" 
            prefix-icon="OfficeBuilding" 
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="register-btn" 
            @click="handleRegister" 
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { register } from '@/apis/AuthApi';
import { User, Lock, Message, Phone, OfficeBuilding } from '@element-plus/icons-vue';

const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phoneNumber: '',
  institution: ''
});

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  institution: [
    { required: true, message: '请输入单位', trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await register(registerForm);
        if (response.success) {
          ElMessage.success(response.msg || '注册成功，请登录');
          router.push('/login');
        } else {
          ElMessage.error(response.msg || '注册失败，请稍后重试');
        }
      } catch (error: any) {
        ElMessage.error('注册失败：' + (error.message || '未知错误'));
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.register-box {
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.register-title {
  text-align: center;
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.register-form {
  margin-top: 20px;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}
</style>