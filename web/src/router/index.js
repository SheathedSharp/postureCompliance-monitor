import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PatientView from '../views/PatientView.vue'
// const PatientView = ()=>import('../views/PatientView.vue') // 路由懒加载
import AnalysisView from '../views/AnalysisView'
import ArticleView from '../views/ArticleView'
import SettingsView from '../views/SettingsView'
import SignView from '../views/SignView'
import Views from '../views/Views'
Vue.use(VueRouter)


const routes = [
  {
    path: '/',
    component: Views,
    children: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true}
      },
      {
        path: '/patient',
        name: 'patient',
        component: PatientView,
        meta: { requiresAuth: true}
      },
      {
        path: '/article',
        name: 'article',
        component: ArticleView,
        meta: { requiresAuth: true}
      },
      {
        path: '/analysis',
        name: 'analysis',
        component: AnalysisView,
        meta: { requiresAuth: true}
      },
      {
        path: '/settings',
        name: 'settings',
        component: SettingsView,
        meta: { requiresAuth: true}
      },
    ],
    meta: { requiresAuth: true}
    
  },
  {
    path: '/signview',
    name: 'sign',
    component: SignView,
    meta: { requiresAuth: false, rejectAuth: true}
  }
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
