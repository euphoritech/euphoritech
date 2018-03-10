<template lang="pug">
  b-container(:fluid="true")
    div(v-if="isLoading")
      loader
    b-row(v-if="!isLoading")
      b-col.main-left-nav(cols="3")
        ul.list-unstyled.sidenav
          li Dashboard
          li Customers
          li Development
          li Support
      b-col the body stuff
</template>

<script>
  export default {
    data() {
      return {
        isLoading: true
      }
    },

    methods: {

    },

    created() {
      this.isLoading = false
    }
  }
</script>
