<template lang="pug">
  div
    euphoritech-header
    router-view
    vue-toastr(ref="toastr")
</template>

<script>
  import EuphoritechHeader from './EuphoritechHeader'
  import ApiData from '../factories/ApiData'

  export default {
    name: 'euphoritech',

    mounted() {
      this.$root.$refs = Object.assign(this.$root.$refs, {toastr: this.$refs.toastr})
      this.$refs.toastr.defaultPosition = "toast-bottom-right"
    },

    async created() {
      // GET ANY SESSION INFO HERE TO BE PUT IN euphoritech-header
    },

    components: {
      EuphoritechHeader
    }
  }
</script>
