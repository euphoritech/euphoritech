import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthError from '@/components/AuthError'
import DashboardContainer from '@/components/entities/dashboard/DashboardContainer'
import TopTenContainer from '@/components/topten/TopTenContainer'
import Login from '@/components/Login'
import NoPageFound from '@/components/NoPageFound'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/autherror/:error', component: AuthError, props: true },
    { path: '/gatekeeper/forgot/password', component: Login },
    { path: '/gatekeeper*', component: Login },
    { path: '/topten*', component: TopTenContainer },
    { path: '/dashboard/entity/:id', component: DashboardContainer, props: true },
    { path: '/dashboard/type/:type_id', component: DashboardContainer, props: true },
    { path: '/dashboard*', component: DashboardContainer },
    { path: '/', component: DashboardContainer },
    { path: '*', component: NoPageFound }
  ]
})
