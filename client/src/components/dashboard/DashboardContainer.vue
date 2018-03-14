<template lang="pug">
  b-container(:fluid="true")
    div(v-if="$store.state.isLoading")
      loader
    b-row(v-if="!$store.state.isLoading")
      side-bar
      component.padding-medium(:is="partialComponent")
</template>

<script>
  import Customers from './Customers'
  import Development from './Development'
  import Home from './Home'
  import Support from './Support'
  import SideBar from './SideBar'

  export default {
    props: [ 'partial' ],

    data() {
      return {
        partialComponent: null
      }
    },

    components: {
      Customers,
      Development,
      Home,
      Support,
      SideBar
    },

    created() {
      const partialRouteMap = {
        dashboard:    'home',
        home:         'home',
        customers:    'customers',
        development:  'development',
        support:      'support'
      }

      this.partialComponent = partialRouteMap[this.partial] || 'home'
    }
  }
</script>
