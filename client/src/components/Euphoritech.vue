<template lang="pug">
  div
    euphoritech-header
    router-view
    vue-toastr(ref="toastr")
</template>

<script>
  import EuphoritechHeader from './EuphoritechHeader'
  import AuthFactory from '../factories/ApiAuth'

  export default {
    name: 'euphoritech',

    mounted() {
      this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
      this.$refs.toastr.defaultPosition = "toast-bottom-right"
    },

    created() {
      this.$store.dispatch('getLoggedInUser')
    },

    components: {
      EuphoritechHeader
    }
  }
</script>
