<template lang="pug">
  b-popover(:ref="target",:target="target",title="Reset Password")
    b-form(@submit="submitPasswordReset")
      div(v-if="$store.state.auth.user.password_hash")
        b-form-group(label="Current Password")
          b-form-input(type="password",v-model="curPw",size="sm",autocomplete="current-password")
        hr
      b-form-group(label="New Password")
        b-form-input(type="password",v-model="newPw",size="sm",autocomplete="new-password")
      b-form-group(label="Confirm New Password")
        b-form-input(type="password",v-model="newPwConf",size="sm",autocomplete="new-password-confirm")
      div.text-center
        b-button(type="submit",variant="primary",size="sm")
          span Submit
          loader-inline.margin-left-small(v-if="isLoadingLocal")
      b-alert.margin-top-medium(:show="!!error",variant="danger") {{ error }}
</template>

<script>
  import ApiAuth from '../factories/ApiAuth'

  export default {
    props: {
      target: { type: String }
    },

    data() {
      return {
        error: null,
        isLoadingLocal: false,
        curPw: null,
        newPw: null,
        newPwConf: null
      }
    },

    methods: {
      doPasswordsMatch() {
        return this.newPw && this.newPw.length > 0 && this.newPw === this.newPwConf
      },

      async submitPasswordReset(evt) {
        try {
          evt.preventDefault()

          if (!this.doPasswordsMatch())
            return this.error = `Make sure you enter a new password and it matches with the confirmed password and try again.`

          this.isLoadingLocal = true
          await ApiAuth.resetPassword({ current_password: this.curPw, new_password: this.newPw })

          this.curPw = this.newPw = this.newPwConf = this.error = null
          this.$refs[this.target].$emit('close')

        } catch(err) {
          this.error = err.message
          this.isLoadingLocal = false
        }
      }
    }
  }
</script>
