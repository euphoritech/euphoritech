<template lang="pug">
  b-navbar(toggleable="md",type="dark",variant="dark")
    b-navbar-toggle(target="nav_collapse")
    b-navbar-brand(href="/") euphoritech
    b-collapse(:is-nav="true",id="nav_collapse")
      b-navbar-nav
        b-nav-item(href="/") Home
      b-navbar-nav(class="ml-auto")
        b-form-input.mr-sm-2(size="sm",placeholder="Search..")
        b-nav-item(v-if="!$store.state.auth.user",href="/login") Login
        b-nav-item(v-if="$store.state.auth.user",href="/settings")
          i.fa.fa-cog
        b-nav-item(v-if="$store.state.auth.user",href="/logout") Logout
</template>

<script>
  import moment from 'moment'

  export default {

  }
</script>
