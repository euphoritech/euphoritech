<template lang="pug">
  div.container.margin-top-large
    b-form(@submit="validateForm($event)",:action="formAction",method="post")
      div(v-if="isLoadingLocal")
        loader
      div.row.d-flex.justify-content-center(v-if="!isLoadingLocal")
        div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-4.col-lg-offset-4
          h1.text-center {{ title }}
          div.d-flex.justify-content-center(style="margin-bottom:25px")
            div(v-if="isCreatingAccount")
              a(href="/gatekeeper/login") Login to Existing Account
            div(v-if="!isCreatingAccount")
              a(href="/gatekeeper/createaccount") Create New Account
          b-card.shadow-small
            div.card-text
              input(type="hidden",id="create",name="create",:value="isCreatingAccount")
              input(type="hidden",id="create_team",name="create_team",:value="createNewTeam")
              b-form-group(label="Email Address",label-for="username")
                b-form-input(id="username",name="username",v-model="data.username")
              hr.margin-vert-large(v-if="isCreatingAccount")
              b-form-group(label="Password",label-for="password")
                b-form-input(id="password",name="password",v-model="data.password",type="password")
              b-form-group(v-if="isCreatingAccount",label="Confirm Password",label-for="cpassword")
                b-form-input(id="cpassword",name="cpassword",v-model="data.confirm_password",type="password")
              div(v-if="isCreatingAccount")
                hr.margin-vert-large
                div.d-flex.justify-content-center.margin-bottom-medium
                  b-button-group
                    b-button(@click="createNewTeam = !createNewTeam",:variant="createNewTeamButtonVariant('create')") Create New Team
                    b-button(@click="createNewTeam = !createNewTeam",:variant="createNewTeamButtonVariant('join')") Join Existing Team
                b-form-group(label="Team ID (5-8 alphanumeric characters)",label-for="team_id")
                  b-form-input(id="team_id",name="team_id",v-model="data.team_id")
                b-form-group(v-if="!!createNewTeam",label="Team Name",label-for="team_name")
                  b-form-input(id="team_name",name="team_name",v-model="data.team_name")
              div.text-center
                b-button(type="submit",variant="primary") {{ title }}
              b-alert.margin-medium(variant="warning",:show="!!error") {{ error }}
          oauth-button(type="google")
          - //oauth-button(type="github")
          div#forgot-password-link.margin-top-large.text-center(v-if="!isCreatingAccount")
            small
              a(href="javascript:void(0)") Forgot Password
          - //div.center-everything.margin-vert-large
          - //  a(href="javascript:void(0)",onclick="window.open('/privacy','','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no')")
          - //    small
          - //      small Privacy Policy
    b-popover(target="forgot-password-link",title="Forgot Password",placement="top")
      div.
        Enter your email address below and submit to get a temporary
        password you can use to login and reset it.
      hr
      b-form-group(label="Email Address")
        b-form-input#forgot-email-address(name="forgot-email-address",v-model="forgot.email",size="sm",:required="true",placeholder="Email Address")
      div.text-center
        b-button(type="button",variant="primary",size="sm",@click="forgotPassword") Submit
      b-alert.margin-top-medium(:show="!!forgot.error",variant="danger") {{ forgot.error }}
</template>

<script>
  import OauthButton from './OauthButton'
  import ApiAuth from '../factories/ApiAuth'
  import ApiTeams from '../factories/ApiTeams'
  import StringHelpers from '../factories/StringHelpers'
  import SnackbarFactory from '../factories/SnackbarFactory'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        error: null,
        data: {
          username: null,
          password: null,
          confirm_password: null,
          team_id: null,
          team_name: null
        },
        forgot: {
          email: null,
          error: null
        },
        createNewTeam: true,
        isCreatingAccount: false,
        formAction: '/auth/local',
        title: 'Login'
      }
    },

    methods: {
      isValidEmail: ApiAuth.isValidEmail,
      isValidTeamId: ApiAuth.isValidTeamId,

      async forgotPassword() {
        try {
          this.forgot.error = null
          const toast = SnackbarFactory(this)
          await ApiAuth.forgotPassword(this.forgot.email)
          toast.open(`Please check your email shortly for a temporary password to login.`)
        } catch(err) {
          this.forgot.error = err.message
        }
      },

      hasDataClass(string) {
        if (string)
          return { 'has-success': true }
        return {}
      },

      createNewTeamButtonVariant(whichButton) {
        const activeButtonVariant = 'primary'
        if (this.createNewTeam && whichButton === 'create')
          return activeButtonVariant

        if (!this.createNewTeam && whichButton !== 'create')
          return activeButtonVariant

        return ''
      },

      async getCreateSubmissionError() {
        if (typeof this.data !== 'object') {
          return 'Please fill out all fields to create an account.'
        } else if (!(this.data.username && this.data.password)) {
          return 'Please enter a valid e-mail address and password.'
        }

        if (this.isCreatingAccount) {
          if (!this.isValidEmail(this.data.username))
            return `Please enter a valid e-mail address as your username and try again.`

          if (!(await ApiAuth.checkUsernameAvailability(this.data.username)))
            return `The username entered has already been registered. Please confirm you entered the correct email address or try to login.`

          if (this.data.password !== this.data.confirm_password)
            return 'Please make sure your passwords match in the fields above and try again.'

          if (!this.isValidTeamId(this.data.team_id))
            return `Please enter a valid team ID (5-8 alphanumeric characters).`

          if (!this.createNewTeam && !(await ApiTeams.checkTeamExists(this.data.team_id)))
            return `The team ID you entered to join does not exist. Please make sure you entered it correctly and try again.`

          if (this.createNewTeam && !(await ApiTeams.checkTeamAvailability(this.data.team_id)))
            return `The team ID you entered is already in use. Please try another team ID and try again.`
        }

        return null
      },

      async validateForm(e) {
        e.preventDefault()
        this.isLoadingLocal = true
        try {
          const error = await this.getCreateSubmissionError()
          if (error) {
            this.isLoadingLocal = false
            return this.error = error
          }

          e.srcElement.submit()

        } catch(err) {
          this.isLoadingLocal = false
          console.log("ERROR", err)
          return this.error = `There was an error creating your account: ${err.message}`
        }
      }
    },

    created() {
      if (this.$store.state.auth.user && this.$store.state.auth.user.id) {
        return location.href = '/'
      } else if (location.pathname.includes('createaccount')) {
        this.formAction = '/auth/createaccount'
        this.title = 'Create Account'
        this.isCreatingAccount = true
      }

      this.error = StringHelpers.unserialize(location.search).error
      this.isLoadingLocal = false
    },

    components: {
      OauthButton
    }
  }
</script>
