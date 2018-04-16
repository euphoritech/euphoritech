<template lang="pug">
  b-row
    b-col
      b-row
        b-col(cols="12",md="2",lg="2")
          strong Username:
        b-col(cols="12",md="10",lg="10")
          div {{ userInfo.username_email }}
        b-col(cols="12",md="2",lg="2")
          strong Name:
        b-col(cols="12",md="10",lg="10")
          div {{ userInfo.name }}
        b-col(cols="12",md="2",lg="2")
          strong Last Login:
        b-col(cols="12",md="10",lg="10")
          div {{ getFormattedDate(userInfo.last_login, 'MMMM Do, YYYY h:mm a') }}
        b-col(cols="12",md="2",lg="2")
          strong Num Logins:
        b-col(cols="12",md="10",lg="10")
          div {{ userInfo.num_logins }}
      - //b-form(@submit="submitPersonal")
      - //  b-form-group(label="Email Address:",label-for="personal-email")
      - //    b-form-input(id="personal-email",name="personal-email",v-model="userInfo.username_email")
</template>

<script>
  import TimeHelpers from '../../factories/TimeHelpers'

  export default {
    data() {
      return {
        userInfo: {
          username_email: null
        }
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,

      submitPersonal(evt) {
        evt.preventDefault()
        console.log('got here...')
      }
    },

    created() {
      let tries = 0
      const userInfoInterval = setInterval(() => {
        if (tries > 10) {
          clearInterval(userInfoInterval)
        } else if (this.$store.state.auth.user) {
          this.userInfo = Object.assign(this.userInfo, this.$store.state.auth.user)
          clearInterval(userInfoInterval)
        } else {
          tries++
        }
      }, 500)
    }
  }
</script>
