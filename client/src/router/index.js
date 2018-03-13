import Vue from 'vue'
import VueRouter from 'vue-router'
import AuthError from '@/components/AuthError'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import Customers from '@/components/Customers'
import Development from '@/components/Development'
import Support from '@/components/Support'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/autherror/:error', component: AuthError, props: true },
    // { path: '/createaccount', component: Login },
    { path: '/login', component: Login },
    { path: '/', component: Dashboard },
    { path: '/dashboard', component: Dashboard },
    { path: '/customers', component: Customers },
    { path: '/development', component: Development },
    { path: '/support', component: Support }
  ]
})
