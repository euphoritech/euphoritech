<template lang="pug">
  div
    div(v-if="$store.state.isLoading")
      loader
    div(v-if="!$store.state.isLoading")
      nav-bar
      router-view
    vue-toastr(ref="toastr")
    settings
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

    async created() {
      await this.$store.dispatch('getSessionInfo')
      if (!AuthFactory.isLoggedIn(this.$store.state) && this.$route.path !== '/login')
        this.$store.dispatch('redirectToLogin')

      this.$store.commit('APP_NO_LONGER_LOADING')
    }
  }
</script>
