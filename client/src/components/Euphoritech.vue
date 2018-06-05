<template lang="pug">
  div
    div(v-if="$store.state.isLoading")
      loader
    div(v-if="!$store.state.isLoading")
      top-main-nav-bar
      div
        div.d-none.d-sm-block(v-if="isLoggedIn")
          side-main-nav
        router-view
    vue-toastr(ref="toastr")
    chat-widget(:logged-in="isLoggedIn")
    create-entity(:logged-in="isLoggedIn")
    settings(:logged-in="isLoggedIn")
</template>

<script>
  import TopMainNavBar from './TopMainNavBar'
  import ChatWidget from './ChatWidget'
  import SideMainNav from './SideMainNav'
  import CreateEntityModal from './entities/create/CreateEntityModal'
  import SettingsContainer from './settings/SettingsContainer'
  import ApiAuth from '../factories/ApiAuth'
  import euphoritechSocket from '../factories/EuphoritechSocket'

  export default {
    name: 'euphoritech',

    data() {
      return {
        isLoggedIn: false
      }
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
        this.$store.commit('CHECK_LOGGED_IN', isLoggedIn)

        if (!this.$store.state.isLoggedIn) {
          if (this.$route.path.indexOf('/gatekeeper/') !== 0 && this.$route.path.indexOf('/autherror/') !== 0)
            this.$store.dispatch('redirectToLogin')

          return this.$store.commit('APP_NO_LONGER_LOADING')
        }

        await this.$store.dispatch('init')

        if (this.$store.state.isLoggedIn && !this.$store.state.session.teams_roles)
          this.$store.dispatch('redirectToNoTeamForm')

        this.$store.commit('APP_NO_LONGER_LOADING')
        this.isLoggedIn = isLoggedIn
      })
    },

    components: {
      ChatWidget,
      CreateEntity: CreateEntityModal,
      TopMainNavBar,
      Settings: SettingsContainer,
      SideMainNav
    }
  }
</script>
