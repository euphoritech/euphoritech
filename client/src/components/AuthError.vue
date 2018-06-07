<template lang="pug">
  div.container
    div.row.d-flex.justify-content-center
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-6.col-lg-offset-6
        b-alert.margin-top-large(variant="danger",:show="!!errorMessage") {{ errorMessage }}
    component(:is="subComponent")
</template>

<script>
  import ErrorMessages from '../factories/ErrorMessages'
  import CreateOrJoinTeam from './CreateOrJoinTeam'
  import ResetPasswordPage from './ResetPasswordPage'
  import Login from './Login'

  export default {
    props: [ 'error' ],

    data() {
      return {
        errorMessage: null,
        subComponent: 'login'
      }
    },

    created() {
      this.errorMessage = ((ErrorMessages[this.error].toString() === '[object Object]') ? ErrorMessages[this.error].error : ErrorMessages[this.error])
      this.subComponent = (ErrorMessages[this.error].toString() === '[object Object]') ?ErrorMessages[this.error].component : this.subComponent

      // Force entering `false` as the error message if you don't want
      // the alert to show with the default message.
      if (!this.errorMessage && this.errorMessage !== false)
        this.errorMessage = 'There was an error with your request. Please try again.'
    },

    components: {
      CreateOrJoinTeam,
      Login,
      ResetPasswordPage
    }
  }
</script>
