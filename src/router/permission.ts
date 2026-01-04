import router from './index';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 交通仿真系统` : '交通仿真系统';

  // 获取权限状态
  const authStore = useAuthStore();
  
  // 开发环境下的特殊处理
  if (import.meta.env.DEV) {
    // 初始化开发环境的模拟数据
    authStore.initDevState();
    
    // 开发环境下直接放行所有路由，跳过登录验证
    if (to.path === '/login') {
      // 开发环境下访问登录页，重定向到首页
      next({ path: '/' });
      return;
    }
    
    // 所有检查通过，放行
    next();
    return;
  }

  // 生产环境的正常流程
  const isLoggedIn = authStore.isLoggedIn;

  // 不需要登录的页面直接放行
  if (!to.meta.requiresAuth) {
    if (isLoggedIn && to.path === '/login') {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/' });
    } else {
      next();
    }
    return;
  }

  // 需要登录的页面
  if (!isLoggedIn) {
    // 未登录，重定向到登录页
    ElMessage.warning('请先登录');
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }

  // 已登录，检查角色权限
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const hasRole = to.meta.roles.some((role: string) => authStore.hasRole(role));
    if (!hasRole) {
      ElMessage.error('权限不足，无法访问该页面');
      next({ path: '/' });
      return;
    }
  }

  // 检查权限
  if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
    const hasPermission = to.meta.permissions.some((permission: string) => authStore.hasPermission(permission));
    if (!hasPermission) {
      ElMessage.error('权限不足，无法访问该页面');
      next({ path: '/' });
      return;
    }
  }

  // 所有检查通过，放行
  next();
});

// 导出路由实例
export default router;