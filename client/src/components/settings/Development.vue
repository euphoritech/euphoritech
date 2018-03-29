<template lang="pug">
  b-card(:no-body="true")
    b-tabs(:card="true")
      b-tab(title="Github")
        div.
          You can integrate your Github PRs &amp; issues to link to your
          customer accounts, QA tickets, etc.
        b-row
          b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
            oauth-button(type="github",href="oauth/github")
</template>

<script>
  import OauthButton from '../OauthButton'

  export default {
    data() {
      return {}
    },

    async created() {

    },

    components: {
      OauthButton
    }
  }
</script>
