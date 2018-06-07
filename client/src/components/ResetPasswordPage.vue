<template lang="pug">
  b-row.margin-top-large
    b-col(cols="12",sm="8",offset-sm="2",lg="4",offset-lg="4")
      b-alert(:show="redirecting",variant="success") Successfully updated password! You will be redirected home shortly...
      b-card(v-if="!redirecting")
        b-card-body
          h3 Reset Password
          div.margin-top-medium.margin-bottom-large
            div Username:
            div
              u
                strong {{ user.username_email }}
          reset-password-form(@reset="passwordReset")
</template>

<script>
  import ResetPasswordForm from './ResetPasswordForm'

  export default {
    data() {
      return {
        redirecting: false,
        user: null
      }
    },

    methods: {
      passwordReset() {
        this.redirecting = true
        setTimeout(() => window.location.href = '/', 2000)
      }
    },

    created() {
      this.user = this.$store.state.initUser
    },

    components: {
      ResetPasswordForm
    }
  }
</script>

<style scoped>
  h3 {
    margin: 0px;
  }
</style>
