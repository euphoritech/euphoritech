import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthError from '@/components/AuthError'
import HomeContainer from '@/components/HomeContainer'
import Login from '@/components/Login'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/autherror/:error', component: AuthError, props: true },
    // { path: '/createaccount', component: Login },
    { path: '/login', component: Login },
    { path: '*', component: HomeContainer }
  ]
})
