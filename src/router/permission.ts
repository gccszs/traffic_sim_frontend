import router from './index';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 交通仿真系统` : '交通仿真系统';

  // 获取权限状态
  const authStore = useAuthStore();
  
  // 检查是否已登录
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