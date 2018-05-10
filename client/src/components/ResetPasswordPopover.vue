<template lang="pug">
  b-popover(target="reset-password-popover",title="Reset Password")
    div
      div(v-if="$store.state.auth.user.password_hash")
        b-form-group(label="Current Password")
          b-form-input(v-model="curPw",size="sm")
        hr
      b-form-group(label="New Password")
        b-form-input(v-model="newPw",size="sm")
      b-form-group(label="Confirm New Password")
        b-form-input(v-model="newPwConf",size="sm")
      div.text-center
        b-button(variant="primary",size="sm") Submit
</template>

<script>
  export default {
    props: {
      target: { type: String }
    },

    data() {
      return {
        curPw: null,
        newPw: null,
        newPwConf: null
      }
    }
  }
</script>
