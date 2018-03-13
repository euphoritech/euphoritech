<template lang="pug">
  b-container(:fluid="true")
    div(v-if="isLoading")
      loader
    b-row(v-if="!isLoading")
      side-bar
      b-col.padding-medium
        b-jumbotron(header="EuphoriTech" lead="EuphoriTech App")
          p For more information visit website:
          b-btn(variant="primary" href="#") More Info
</template>

<script>
  import SideBar from './SideBar'

  export default {
    data() {
      return {
        isLoading: true,
      }
    },

    components: {
      SideBar
    },

    methods: {

    },

    created() {
      this.isLoading = false
    }
  }
</script>
