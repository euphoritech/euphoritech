// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import fetchDefaults from 'fetch-defaults'
import * as FastClick from 'fastclick'
import store from './vuex/store'
import Euphoritech from './components/Euphoritech'
import router from './router'

// external libraries and components
import 'whatwg-fetch'
import Toastr from 'vue-toastr'
import Loader from './components/Loader'
import LoaderInline from './components/LoaderInline'
import Datepicker from './components/Datepicker'
import ToggleSwitch from './components/ToggleSwitch'
import TypeaheadInput from './components/TypeaheadInput'
import { handleFetchResponse } from './factories/ApiHelpers'

// css
import 'vue-toastr/src/vue-toastr.less'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/main.scss'

window.euphoritechFetch = fetchDefaults(fetch, { credentials: 'same-origin' })
window.vueRouter        = router

// Initiate FastClick for mobile devices to remove the built-in 300ms
// delay. Read more in https://github.com/ftlabs/fastclick
if ('addEventListener' in document)
  document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body), false)

Vue.use(BootstrapVue)
Vue.component('Loader', Loader)
Vue.component('LoaderInline', LoaderInline)
Vue.component('datepicker', Datepicker)
Vue.component('TypeaheadInput', TypeaheadInput)
Vue.component('toggle-switch', ToggleSwitch)
Vue.component('vue-toastr', Toastr)

Vue.config.productionTip = false

// Needed to make component `TypeaheadInput` work, see src at
// https://github.com/pespantelis/vue-typeahead/blob/master/src/main.js
Vue.prototype.$http = {
  async get(src, { params }) {
    const queryStringDelim = (src.includes('?')) ? '&' : '?'
    if (params && params.search)
      src = `${src}${queryStringDelim}search=${params.search}`

    const response = await window.euphoritechFetch(src)
    const data = await handleFetchResponse(response)
    return { data }
  }
}

/* eslint-disable no-new */
new Vue({
  store,
  el: '#euphoritech',
  router,
  template: '<Euphoritech/>',
  components: { Euphoritech }
})
