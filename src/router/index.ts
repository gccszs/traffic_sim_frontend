import { createRouter, createWebHistory } from 'vue-router'
import HistoryViewVue from '@/views/HistoryView.vue'
import SettingViewVue from '@/views/SettingView.vue'
import SimPIViewVue from '@/views/SimPIView.vue'
import PIStepsVue from '@/views/SimSteps/PISteps.vue'
import LoginViewVue from '@/views/LoginView.vue'
import RegisterViewVue from '@/views/RegisterView.vue'
import MapManagerViewVue from '@/views/MapManagerView.vue'
import ProfileViewVue from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginViewVue,
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterViewVue,
      meta: {
        title: '注册',
        requiresAuth: false
      }
    },
    {
      path: '/',
      name: 'home',
      component: HistoryViewVue,
      meta: {
        title: '历史数据',
        requiresAuth: true
      }
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingViewVue,
      meta: {
        title: '全局设置',
        requiresAuth: true,
        roles: ['admin'] // 仅管理员可访问
      }
    },
    {
      path: '/simpisetup',
      name : 'simpisetup',
      component: PIStepsVue,
      meta: {
        title: '交互仿真设置',
        requiresAuth: true
      }
    },
    {
      path: '/simpi',
      name : 'startsimpi',
      component: SimPIViewVue,
      meta: {
        title: '交通仿真',
        requiresAuth: true
      }
    },
    {
      path: '/mapmanager',
      name: 'mapmanager',
      component: MapManagerViewVue,
      meta: {
        title: '地图管理',
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileViewVue,
      meta: {
        title: '个人中心',
        requiresAuth: true
      }
    }
  ]
})

export default router
