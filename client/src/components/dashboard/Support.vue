<template lang="pug">
  b-col
    b-jumbotron(header="Euphoritech",lead="Euphoritech App")
      p For more information visit website:
      b-btn(variant="primary" href="#") More Info
</template>

<script>
  export default {
    data() {
      return {
        isLoading: true,
      }
    },

    methods: {

    },

    created() {
      this.isLoading = false
    }
  }
</script>
