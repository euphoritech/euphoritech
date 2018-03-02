import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeContainer from '@/components/HomeContainer'
import Login from '@/components/Login'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/createaccount', component: Login },
    { path: '/login', component: Login },
    { path: '*', component: HomeContainer }
  ]
})
