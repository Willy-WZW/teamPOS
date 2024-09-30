import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/setting',
      name: 'setting',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Setting.vue')
    },
    {
      path: '/operation',
      name: 'operation',
      component: () => import('../views/Operation.vue')
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('../views/Order.vue')
    },
    {
      path: '/orderStatus',
      name: 'orderStatus',
      component: () => import('../views/OrderStatus.vue')
    },
    {
      path: '/tableAndCheckout',
      name: 'tableAndCheckout',
      component: () => import('../views/TableAndCheckout.vue')
    },
    {
      path: '/event',
      name: 'event',
      component: () => import('../views/Event.vue')
    },
    {
      path: '/workstation',
      name: 'workstation',
      component: () => import('../views/Workstation.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/History.vue')
    },
    {
      path: '/system',
      name: 'system',
      component: () => import('../views/System.vue')
    },
    {
      path: '/busiSetting',
      name: 'busiSetting',
      component: () => import('../views/BusiSetting.vue')
    },
  ]
})

export default router
