<template lang="pug">
  div
    div(v-if="$store.state.isLoadingLocal")
      loader
    div(v-if="!$store.state.isLoadingLocal")
      b-card(:no-body="true")
        b-tabs(:card="true")
          b-tab(title="Main")
            div Manage your development settings here.
          b-tab(v-if="true",title="Github")
            div.
              You can integrate your Github PRs &amp; issues to link to your
              customer accounts, QA tickets, etc.
            b-row
              b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                oauth-button(type="github",href="oauth/github")
</template>

<script>
  import OauthButton from '../OauthButton'
  import ApiEnv from '../../factories/ApiEnv'

  export default {
    data() {
      return {
        isLoadingLocal: false,
        hasGithub: false
      }
    },

    async created() {
      this.hasGithub = await ApiEnv.hasIntegration('github')
      this.isLoadingLocal = true
    },

    components: {
      OauthButton
    }
  }
</script>
