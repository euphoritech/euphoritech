<template lang="pug">
  b-container
    div(v-if="isLoading")
      loader
    b-row(v-if="!isLoading")
      b-col Some infoooooo
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
