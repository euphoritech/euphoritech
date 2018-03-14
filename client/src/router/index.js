import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthError from '@/components/AuthError'
import DashboardContainer from '@/components/dashboard/DashboardContainer'
import Login from '@/components/Login'
import NoPageFound from '@/components/NoPageFound'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/autherror/:error', component: AuthError, props: true },
    // { path: '/createaccount', component: Login },
    { path: '/login', component: Login },
    { path: '/dashboard/:partial', component: DashboardContainer, props: true },
    { path: '/', component: DashboardContainer },
    { path: '*', component: NoPageFound }
  ]
})
