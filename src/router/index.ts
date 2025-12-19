import { createRouter, createWebHistory } from 'vue-router'
import HistoryViewVue from '@/views/HistoryView.vue'
import SettingViewVue from '@/views/SettingView.vue'
import SimPIViewVue from '@/views/SimPIView.vue'
import PIStepsVue from '@/views/SimSteps/PISteps.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HistoryViewVue
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingViewVue
    },
    {
      path: '/simpisetup',
      name : 'simpisetup',
      component: PIStepsVue
    },
    {
      path: '/simpi',
      name : 'startsimpi',
      component: SimPIViewVue
    }
  ]
})

export default router
