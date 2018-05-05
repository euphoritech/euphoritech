<template lang="pug">
  div
    div this is a github integration
    typeahead-input(:params="{ src: '/api/1.0/auth/session', keysFromResponse: 'session.current_team_types' }",@onHit="selectGithubRepo")
</template>

<script>
  import ApiIntegrations from '../../factories/ApiIntegrations'

  export default {
    methods: {
      async githubSearchRepos(searchText) {
        const results = await ApiIntegrations.githubSearchRepos(searchText)
      },

      selectGithubRepo(repo) {
        console.log("REPO", repo)
      }
    }
  }
</script>
