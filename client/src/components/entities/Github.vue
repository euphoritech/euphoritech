<template lang="pug">
  div
    div(v-if="!selectedRepo")
      div Find a repository to search in:
      typeahead-input(src="/api/1.0/integrations/github/repos/search",:params="{ keysFromResponse: 'results', showProp: 'name' }",@onHit="selectGithubRepo")
    div(v-if="selectedRepo")
      div
        div Enter an issue or PR number in repo:
        div
          strong {{ selectedRepo }}
          i.margin-left-small.fa.fa-times(style="color: red; cursor: pointer;",@click="selectedRepo = null")
        b-form-input(v-model="itemNumber",@keyup.native="getIssueOrPr")
        div.text-center(v-if="isLoadingLocal")
          loader
        b-alert.text-center.margin-top-medium(:show="!!error",variant="danger") {{ error }}
</template>

<script>
  import ApiIntegrations from '../../factories/ApiIntegrations'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        error: null,
        isLoadingLocal: false,
        itemNumber: null,
        selectedRepo: null
      }
    },

    methods: {
      selectGithubRepo(repo) {
        this.selectedRepo = repo.name
      },

      async getIssueOrPr(evt) {
        this.error = null
        const toast = SnackbarFactory(this)

        if (evt.keyCode === 13) {
          if (this.itemNumber) {
            this.isLoadingLocal = true

            let result
            try {
              result = (await ApiIntegrations.githubFindItemInRepo({ repo: this.selectedRepo, num: this.itemNumber })).result
            } catch(err) {
              this.isLoadingLocal = false
              return this.error = err.message
            }

            this.$emit("setEntityData", {
              source: 'github',
              name: result.title,
              description: result.body,
              uid: result.number,
              mod1: this.selectedRepo,
              mod2: result.html_url,
              mod3: result.url,
              mod4: result.user.login,
              mod5: result.closed_at
            })

            this.isLoadingLocal = false
          } else {
            toast.open("Please enter a valid issue or PR ID to find.", 'error')
          }
        }
      }
    },

    async created() {
      // await ApiIntegrations.githubOrgMembers()
      // await ApiIntegrations.githubGetUserIssues('useriq-app')
    }
  }
</script>
