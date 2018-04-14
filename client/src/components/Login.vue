<template lang="pug">
  div.container.margin-top-large
    div.row.d-flex.justify-content-center
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-4.col-lg-offset-4
        h1.text-center {{ title }}
        div.d-flex.justify-content-center(style="margin-bottom:25px")
          div(v-if="createValue")
            a(href="/login") Login to Existing Account
          div(v-if="!createValue")
            a(href="/createaccount") Create New Account
        b-card.shadow-small
          div.card-text
            b-form(@submit="validateForm($event)",:action="formAction",method="post")
              input(type="hidden",id="create",name="create",:value="createValue")
              input(type="hidden",id="create_team",name="create_team",:value="createNewTeam")
              b-form-group(label="Username",label-for="username")
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
                    b-button(@click="createNewTeam = !createNewTeam",:variant="createNewTeamButtonVariant('join')") Join Team
                b-form-group(label="Team ID (5-8 alphanumeric characters)",label-for="team_id")
                  b-form-input(id="team_id",name="team_id",v-model="data.team_id")
                b-form-group(v-if="!!createNewTeam",label="Team Name",label-for="team_name")
                  b-form-input(id="team_name",name="team_name",v-model="data.team_name")
              div.text-center
                b-button(type="submit",variant="primary") {{ title }}
              b-alert.margin-medium(variant="warning",:show="error") {{ error }}
        oauth-button(type="google")
        //- oauth-button(type="github")
        - //div.center-everything.separate-vert-large
        - //  a(href="javascript:void(0)",onclick="window.open('/privacy','','directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no')")
        - //    small
        - //      small Privacy Policy
</template>

<script>
  import OauthButton from './OauthButton'
  import ApiAuth from '../factories/ApiAuth'
  import StringHelpers from '../factories/StringHelpers'

  export default {
    data() {
      return {
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

      getCreateSubmissionError() {
        if (typeof this.data !== 'object') {
          return 'Please fill out all fields to create an account.'
        } else if (!(this.data.username && this.data.password)) {
          return 'Please enter a valid username and password.'
        }

        if (this.createValue) {
          if (this.data.password !== this.data.confirm_password)
            return 'Please make sure your passwords match in the fields above and try again.'

          if (!this.isValidTeamId(this.data.team_id))
            return `Please enter a valid team ID (5-8 alphanumeric characters).`
        }

        return null
      },

      async validateForm(e) {
        const error = this.getCreateSubmissionError()
        if (error) {
          e.preventDefault()
          setTimeout(() => this.error = null, 5000)
          return this.error = error
        }

        return true
      }
    },

    created() {
      if (location.pathname === '/createaccount') {
        this.formAction = '/auth/createaccount'
        this.title = 'Create Account'
        this.createValue = true
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
