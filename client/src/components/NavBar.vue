<template lang="pug">
  b-navbar(toggleable="md",type="dark",variant="dark")
    b-navbar-toggle(target="nav_collapse")
    b-navbar-brand(href="/") euphoritech
    b-collapse(:is-nav="true",id="nav_collapse")
      b-navbar-nav
        b-nav-item(href="/") Home
      b-navbar-nav(class="ml-auto")
        b-form-input.mr-sm-2(size="sm",placeholder="Search..")
        b-nav-item(v-if="!isLoggedIn",href="/login") Login
        b-nav-item(v-if="isLoggedIn",@click="toggleSettings")
          i.fa.fa-cog
        b-nav-item(v-if="isLoggedIn",href="/logout") Logout
</template>

<script>
  import moment from 'moment'
  import AuthFactory from '../factories/ApiAuth'

  export default {
    computed: {
      isLoggedIn() {
        return AuthFactory.isLoggedInLocal(this.$store.state)
      }
    },

    methods: {
      async toggleSettings() {
        await this.$store.dispatch('toggleSettingsModal')
      }
    }
  }
</script>
