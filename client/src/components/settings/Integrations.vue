<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-card(:no-body="true")
        b-tabs(:card="true")
          b-tab(title="Main")
            div Manage your integration settings here.
          b-tab(v-if="true",title="Github")
            div.
              You can integrate your Github PRs &amp; issues to link to your
              customer accounts, QA tickets, etc.
            b-row
              b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                oauth-button(type="github",href="oauth/github")
          b-tab(v-if="hasSfdc",title="Salesforce")
            div You can pull your customers from Salesforce here.
            b-row
              b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                oauth-button(type="salesforce",href="/oauth/salesforce")
</template>

<script>
  import OauthButton from '../OauthButton'
  import ApiEnv from '../../factories/ApiEnv'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        hasGithub: false,
        hasSfdc: false,
        hasZendesk: false
      }
    },

    async created() {
      const [ hasGithub, hasSfdc, hasZendesk ] = await Promise.all([
        ApiEnv.hasIntegration('github'),
        ApiEnv.hasIntegration('salesforce'),
        ApiEnv.hasIntegration('zendesk')
      ])
      this.hasGithub = hasGithub
      this.hasSfdc = hasSfdc
      this.hasZendesk = hasZendesk
      this.isLoadingLocal = false
    },

    components: {
      OauthButton
    }
  }
</script>
