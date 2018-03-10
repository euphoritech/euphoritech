<template lang="pug">
  div.container.margin-top-large
    div.row.d-flex.justify-content-center
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-4.col-lg-offset-4
        b-alert(variant="danger",:show="errorMessage") {{ errorMessage }}
    login
</template>

<script>
  import ErrorMessages from '../factories/ErrorMessages'
  import Login from './Login'

  export default {
    props: [ 'error' ],

    data() {
      return { errorMessage: null }
    },

    created() {
      this.errorMessage = ErrorMessages[this.error] || 'There was an error with your request. Please try again.'
    },

    components: {
      Login
    }
  }
</script>
