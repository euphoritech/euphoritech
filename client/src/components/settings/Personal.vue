<template lang="pug">
  b-row
    b-col
      b-form(@submit="submitPersonal")
        b-form-group(label="Email Address:",label-for="personal-email")
          b-form-input(id="personal-email",name="personal-email",v-model="userInfo.username_email")
</template>

<script>
  export default {
    data() {
      return {
        userInfo: {
          username_email: null
        }
      }
    },

    methods: {
      submitPersonal(evt) {
        evt.preventDefault()
        console.log('got here...')
      }
    },

    created() {
      setImmediate(() => this.userInfo = Object.assign(this.userInfo, this.$store.state.auth.user))
    }
  }
</script>
