<template lang="pug">
  div
    div(v-if="$store.state.isLoading")
      loader
    div(v-if="!$store.state.isLoading")
      nav-bar
      router-view
    vue-toastr(ref="toastr")
    create-entity(:logged-in="isLoggedIn")
    settings(:logged-in="isLoggedIn")
</template>

<script>
  import NavBar from './NavBar'
  import ApiAuth from '../factories/ApiAuth'
  import euphoritechSocket from '../factories/EuphoritechSocket'

  export default {
    name: 'euphoritech',

    data() {
      return {
        isLoggedIn: false
      }
    },

    components: {
      NavBar
    },

    mounted() {
      this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
      this.$refs.toastr.defaultPosition = "toast-bottom-right"
    },

    async created() {
      euphoritechSocket.on('connect', () => euphoritechSocket.emit('subscribe'))
      euphoritechSocket.on('disconnect', () => console.log("SOCKETDISCONNECTED"))

      // Begin app initialization after we determine the logged in state of
      // the user
      euphoritechSocket.on('isLoggedIn', async isLoggedIn => {
        this.isLoggedIn = isLoggedIn
        this.$store.commit('CHECK_LOGGED_IN', isLoggedIn)

        if (!this.$store.state.isLoggedIn) {
          if (this.$route.path !== '/createaccount' && this.$route.path !== '/login' && this.$route.path.indexOf('/autherror/') !== 0)
            this.$store.dispatch('redirectToLogin')

          return this.$store.commit('APP_NO_LONGER_LOADING')
        }

        await this.$store.dispatch('init')

        if (this.$store.state.isLoggedIn && !this.$store.state.session.teams_roles)
          this.$store.dispatch('redirectToNoTeamForm')

        this.$store.commit('APP_NO_LONGER_LOADING')
      })
    }
  }
</script>
