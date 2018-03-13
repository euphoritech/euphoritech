<template lang="pug">
  div.container.margin-top-large
    div.row.d-flex.justify-content-center
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-6.col-lg-offset-6
        b-alert(variant="danger",:show="errorMessage") {{ errorMessage }}
    component(:is="subComponent")
</template>

<script>
  import ErrorMessages from '../factories/ErrorMessages'
  import CreateOrJoinTeam from './CreateOrJoinTeam'
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
      this.errorMessage = ((ErrorMessages[this.error].toString() === '[object Object]') ? ErrorMessages[this.error].error : ErrorMessages[this.error]) || 'There was an error with your request. Please try again.'
      this.subComponent = (ErrorMessages[this.error].toString() === '[object Object]') ?ErrorMessages[this.error].component : this.subComponent
    },

    components: {
      CreateOrJoinTeam,
      Login
    }
  }
</script>
