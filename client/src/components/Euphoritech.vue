<template lang="pug">
  div
    nav-bar
    router-view
    vue-toastr(ref="toastr")
</template>

<script>
  import NavBar from './NavBar'
  import AuthFactory from '../factories/ApiAuth'

  export default {
    name: 'euphoritech',

    components: {
      NavBar
    },

    mounted() {
      this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
      this.$refs.toastr.defaultPosition = "toast-bottom-right"
    },

    created() {
      this.$store.dispatch('getLoggedInUser')
    }
  }
</script>
