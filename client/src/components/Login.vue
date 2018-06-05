<template lang="pug">
  div.container.margin-top-large
    b-form(@submit="validateForm($event)",:action="formAction",method="post")
      div(v-if="isLoadingLocal")
        loader
      div.row.d-flex.justify-content-center(v-if="!isLoadingLocal")
        div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-4.col-lg-offset-4
          h1.text-center {{ title }}
          div.d-flex.justify-content-center(style="margin-bottom:25px")
            div(v-if="createValue")
              a(href="/gatekeeper/login") Login to Existing Account
            div(v-if="!createValue")
              a(href="/gatekeeper/createaccount") Create New Account
          b-card.shadow-small
            div.card-text
              input(type="hidden",id="create",name="create",:value="createValue")
              input(type="hidden",id="create_team",name="create_team",:value="createNewTeam")
              b-form-group(label="Email Address",label-for="username")
                b-form-input(id="username",name="username",v-model="data.username")
              hr.separate-vert-large(v-if="createValue")
              b-form-group(label="Password",label-for="password")
                b-form-input(id="password",name="password",v-model="data.password",type="password")
              b-form-group(v-if="createValue",label="Confirm Password",label-for="cpassword")
                b-form-input(id="cpassword",name="cpassword",v-model="data.confirm_password",type="password")
              div(v-if="createValue")
                hr.separate-vert-large
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
          - //div.center-everything.separate-vert-large
          - //  a(href="javascript:void(0)",onclick="window.open('/privacy','','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no')")
          - //    small
          - //      small Privacy Policy
</template>

<script>
  import OauthButton from './OauthButton'
  import ApiAuth from '../factories/ApiAuth'
  import ApiTeams from '../factories/ApiTeams'
  import StringHelpers from '../factories/StringHelpers'

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
        createNewTeam: true,
        createValue: null,
        formAction: '/auth/local',
        title: 'Login'
      }
    },

    methods: {
      isValidEmail: ApiAuth.isValidEmail,
      isValidTeamId: ApiAuth.isValidTeamId,

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

        if (this.createValue) {
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
      } else if (location.pathname === '/createaccount') {
        this.formAction = '/auth/createaccount'
        this.title = 'Create Account'
        this.createValue = true
      }

      this.error = StringHelpers.unserialize(location.search).error
      this.isLoadingLocal = false
    },

    components: {
      OauthButton
    }
  }
</script>
