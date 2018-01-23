<template lang="pug">
  b-navbar(toggleable="md",type="dark",variant="dark")
    b-navbar-toggle(target="nav_collapse")
    b-navbar-brand(href="/") Euphoritech
    b-collapse(:is-nav="true",id="nav_collapse")
      b-navbar-nav
        b-nav-item Home
        b-nav-item Somewhere
      b-navbar-nav(class="ml-auto")
        b-form-input(size="sm",class="mr-sm-2",placeholder="search for stuff..")
</template>

<script>
  import moment from 'moment'

  export default {
    created() {
      console.log('loggedInUser', this.$store.state.loggedInUser)
    }
  }
</script>
