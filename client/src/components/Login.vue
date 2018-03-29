<template lang="pug">
  div.container.margin-top-large
    div.row.d-flex.justify-content-center
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-4.col-lg-offset-4
        h1 {{ title }}
        b-card.shadow-small
          div.card-text
            - //b-form(@submit="validateForm($event)")
            b-form(action="/auth/local",method="post")
              input(type="hidden",id="create",name="create",:value="createValue")
              b-form-group(label="Username",label-for="username")
                b-form-input(id="username",name="username",v-model="data.username")
              hr.separate-vert-large(v-if="createValue")
              b-form-group(label="Password",label-for="password")
                b-form-input(id="password",name="password",v-model="data.password",type="password")
              b-form-group(v-if="createValue",label="Confirm Password",label-for="cpassword")
                b-form-input(id="cpassword",v-model="data.confirm_password",type="password")
              div.text-center
                b-button(type="submit",class="btn btn-default") {{ title }}
              b-alert.margin-medium(variant="warning",:show="error") {{ error }}
        oauth-button(type="google")
        //- oauth-button(type="github")
        - //div.center-everything.separate-vert-large(v-if="createValue")
        - //  a(href="/login") Login to Existing Account
        - //div.center-everything.separate-vert-large(v-if="!createValue")
        - //  a(href="/createaccount") Create New Account
        - //div.center-everything.separate-vert-large
        - //  a(href="javascript:void(0)",onclick="window.open('/privacy','','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no')")
        - //    small
        - //      small Privacy Policy
</template>

<script>
  import OauthButton from './OauthButton'
  import AuthFactory from '../factories/ApiAuth'
  import StringHelpers from '../factories/StringHelpers'

  export default {
    data() {
      return {
        error: null,
        data: {
          username: null,
          password: null,
          confirm_password: null
        },
        title: 'Login',
        createValue: ''
      }
    },
    methods: {
      hasDataClass(string) {
        if (string)
          return {'has-success': true}
        return {}
      },

      getCreateSubmissionError(checkConfirmation=false) {
        if (typeof this.data !== 'object') {
          return 'Please fill out all fields to create an account.'
        } else if (!(this.data.username && this.data.password)) {
          return 'Please enter a valid username and password.'
        }

        if (checkConfirmation && this.data.password !== this.data.confirm_password) {
          return 'Please make sure your passwords match in the fields above and try again.'
        }
        return null
      },

      async validateForm(e) {
        // e.preventDefault()
        // const error = this.getCreateSubmissionError(!!this.createValue)
        // if (error) {
        //   setTimeout(() => this.error = null, 5000)
        //   return this.error = error
        // }
        //
        //
        // const response = await AuthFactory.loginOrCreateAccount(this.data.username, this.data.password, this.createValue)
        // console.log('repsonse', response)
        // if (response.error)
        //   return this.error = response.error
        // location.href = '/dashboard'
      }
    },

    created() {
      const path = location.pathname
      if (path.indexOf('createaccount') > -1) {
        this.title = 'Create Account'
        this.createValue = 'true'
      }

      this.error = StringHelpers.unserialize(location.search).error
    },

    components: {
      OauthButton
    }
  }
</script>

<style scoped>
  input {
    margin-bottom: 10px;
  }
</style>
