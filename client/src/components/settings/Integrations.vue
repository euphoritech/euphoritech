<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-card(:no-body="true")
        b-tabs(:card="true")
          b-tab(title="Main")
            div Manage your integration settings here.
          b-tab(v-if="env.hasGithub",title="Github")
            div(v-if="!team.hasGithub")
              div Your team hasn't integrated with Github yet.
            div(v-if="team.hasGithub")
              div Your team has integrated with Github!
            hr
            div(v-if="!user.hasGithub")
              div.
                After you authenticate with Github, you can use PRs &amp; issues to link to
                your customer accounts, QA tickets, etc.
              b-row
                b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                  oauth-button(type="github",href="/oauth/github")
            div(v-if="user.hasGithub")
              div.
                Would you like to use your Github authentication information for
                your team to search your repositories for PRs and issues that they'd
                like to link to other records?
              b-button.separate-vert-medium(@click="useUserIntegration('github')",variant="primary") Click Here to Use Your Auth Info
          b-tab(v-if="env.hasSfdc",title="Salesforce")
            div You can pull your customers from Salesforce here.
            b-row
              b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                oauth-button(type="salesforce",href="/oauth/salesforce")
</template>

<script>
  import OauthButton from '../OauthButton'
  import ApiEnv from '../../factories/ApiEnv'
  import ApiIntegrations from '../../factories/ApiIntegrations'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        isLoadingLocal: true,

        env: {
          hasGithub: false,
          hasSfdc: false,
          hasZendesk: false
        },

        team: {
          hasGithub: false,
          hasSfdc: false,
          hasZendesk: false
        },

        user: {
          hasGithub: false,
          hasSfdc: false,
          hasZendesk: false
        }
      }
    },

    methods: {
      async useUserIntegration(type) {
        const response = await ApiIntegrations.saveTeamIntegration({ type })
        SnackbarFactory(this).open(`Successfully added your ${type} integration to the team!`)
      }
    },

    async created() {
      const [ envHasGithub, envHasSfdc, envHasZendesk ] = await Promise.all([
        ApiEnv.hasIntegration('github'),
        ApiEnv.hasIntegration('salesforce'),
        ApiEnv.hasIntegration('zendesk')
      ])
      this.env.hasGithub  = envHasGithub
      this.env.hasSfdc    = envHasSfdc
      this.env.hasZendesk = envHasZendesk
      this.team.hasGithub = !!this.$store.state.auth.team_integrations.github
      this.user.hasGithub = !!this.$store.state.auth.user_integrations.github

      this.isLoadingLocal = false
    },

    components: {
      OauthButton
    }
  }
</script>
