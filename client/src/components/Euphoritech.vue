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
      euphoritechSocket.on('connect', () => euphoritechSocket.emit('subscribe', { yo: 'bro' }))
      euphoritechSocket.on('subscribeConfirm', data => console.log("subscribeConfirm", data))
      euphoritechSocket.on('disconnect', () => console.log("SOCKETDISCONNECTED"))

      await this.$store.dispatch('init')
      if (!AuthFactory.isLoggedIn(this.$store.state) && this.$route.path !== '/login' && this.$route.path.indexOf('/autherror/') !== 0)
        this.$store.dispatch('redirectToLogin')

      if (AuthFactory.isLoggedIn(this.$store.state) && !this.$store.state.session.teams_roles)
        this.$store.dispatch('redirectToNoTeamForm')

      this.$store.commit('APP_NO_LONGER_LOADING')
    }
  }
</script>
