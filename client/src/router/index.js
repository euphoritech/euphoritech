import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeContainer from '@/components/HomeContainer'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '*', component: HomeContainer }
  ]
})
