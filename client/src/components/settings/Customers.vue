<template lang="pug">
  div
    div(v-if="$store.state.isLoadingLocal")
      loader
    div(v-if="!$store.state.isLoadingLocal")
      b-card(:no-body="true")
        b-tabs(:card="true")
          b-tab(title="Main")
            div Manage your customer settings here.
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
        hasSfdc: false
      }
    },

    async created() {
      this.hasSfdc = await ApiEnv.hasIntegration('salesforce')
      this.isLoadingLocal = false
    },

    components: {
      OauthButton
    }
  }
</script>
