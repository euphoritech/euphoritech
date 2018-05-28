<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-card(:no-body="true")
        b-tabs(:card="true")
          //- b-tab(title="Main")
          //-   div Manage your integration settings here.
          b-tab(v-if="env.hasGithub",title="GitHub")
            div(v-if="!team.hasGithub")
              div Your team hasn't integrated with GitHub yet.
            div(v-if="team.hasGithub")
              div Your team has integrated with GitHub!
              div.default-github-org.margin-top-medium
                b-form-group(label="Is this a GitHub organization?")
                  b-form-radio-group(v-model="github.orgType",:options="typeOptions")
                div(v-if="github.org")
                  small The organization that you can pull down PRs and Issues from:
                  h3 {{ github.org }}
                    i.remove-icon.margin-left-small.fa.fa-times(@click="selectGithubOrg({ login: null })")
                  b-button.separate-vert-medium(@click="useUserIntegration('github')",variant="primary",size="sm") Save Organization
                div(v-if="!github.org")
                  b-form-checkbox(@change="selectGithubOrg({ login: true })") Use your personal GitHub account as the team's organization
                  typeahead-input(src="/api/1.0/integrations/github/orgs/search",:params="{ keysFromResponse: 'results', showProp: 'login', minChars: 1 }",@onHit="selectGithubOrg")
            hr(v-if="!userIsTeamIntegration('github')")
            div(v-if="!userIsTeamIntegration('github')")
              div(v-if="!user.hasGithub")
                div.
                  After you authenticate with GitHub, you can use PRs &amp; issues to link to
                  your customers, QA tickets, etc.
                b-row
                  b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                    oauth-button(type="github",href="/oauth/github")
              div(v-if="user.hasGithub")
                div.
                  Would you like to use your GitHub authentication information for
                  your team to search your repositories for PRs and issues that you and your
                  team would like to link to other records?
                b-button.separate-vert-medium(@click="useUserIntegration('github', false)",variant="primary",size="sm") Use my API Info and Save
            div(v-if="github.orgType == 'org' && !!github.org")
              hr
              h3
                span Bulk Record Import
                b-badge.margin-left-small(v-if="github.bulk.numImported && github.bulk.numImported > 0",variant="primary",:pill="true") {{ github.bulk.numImported }} processed
              div(v-if="!github.bulk.repo")
                div
                  small Find a repository in {{ github.org }}:
                typeahead-input(:src="'/api/1.0/integrations/github/repos/search?org=' + github.org",:params="{ keysFromResponse: 'results', showProp: 'name', minChars: 1 }",@onHit="bulkImportSelectRepo")
              div(v-if="github.bulk.repo")
                div
                  small
                    a(href="javascript:void(0)",@click="github.bulk.repo = null") Reset Repo
                //- div Repository to import records from:
                //-   strong  {{ github.bulk.repo }}
                b-row
                  b-col(cols="12",md="6")
                    div
                      small Select a record type to assign the imported records to
                    b-form-select(v-model="github.bulk.entityTypeId",:options="entityTypes",placeholder="Select a record type to assign the imported records to")
                b-button.margin-top-small(variant="primary",@click="startGithubBulkImport") Import Issues and Pull Requests from '{{ github.bulk.repo }}'
          b-tab(v-if="env.hasSfdc",title="Salesforce")
            div(v-if="!team.hasSfdc")
              div No team integration yet...
            div(v-if="team.hasSfdc")
              integrations-salesforce-objects(:entityTypes="entityTypes",@bulkImport="startSalesforceBulkImport")
            hr(v-if="!userIsTeamIntegration('salesforce')")
            div(v-if="!userIsTeamIntegration('salesforce')")
              div(v-if="!user.hasSfdc")
                div You can pull records from your Salesforce instance here, such as your customer or user information.
                b-row
                  b-col(cols="12",offset="0",md="8",offset-md="2",lg="4",offset-lg="4")
                    oauth-button(type="salesforce",href="/oauth/salesforce")
              div(v-if="user.hasSfdc")
                div.
                  Would you like to use your Salesforce authentication information
                  for your team to search your SF objects that you and your team
                  would like to link to other records?
                b-button.separate-vert-medium(@click="useUserIntegration('salesforce', false)",variant="primary",size="sm") Use my Info and Save
</template>

<script>
  import OauthButton from '../OauthButton'
  import IntegrationsSalesforceObjects from './IntegrationsSalesforceObjects'
  import ApiEntities from '../../factories/ApiEntities'
  import ApiEnv from '../../factories/ApiEnv'
  import ApiIntegrations from '../../factories/ApiIntegrations'
  import EuphoritechSocket from '../../factories/EuphoritechSocket'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        entityTypes: [],
        typeOptions: [{ text: 'Yes', value: 'org' }, { text: 'No', value: 'user' }],

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
        },

        github: {
          org: null,
          orgType: 'org',

          bulk: {
            isProcessing: false,
            repo: null,
            user: null,
            entityTypeId: null,
            numImported: 0
          }
        },

        salesforce: {
          bulk: {
            isProcessing: false,
            numImported: 0
          }
        }
      }
    },

    methods: {
      bindSocketEvents() {
        EuphoritechSocket.on('githubBulkAddedRecord', ({ record }) => {
          // console.log("IMPORTED REC", record)
          this.github.bulk.numImported++
        })

        EuphoritechSocket.on('githubBulkFinished', () => this.github.bulk.isProcessing = false)
        EuphoritechSocket.on('salesforceBulkFinished', () => this.salesforce.bulk.isProcessing = false)
      },

      userIsTeamIntegration(type) {
        return (
          this.$store.state.auth.team_integrations[type] &&
          this.$store.state.auth.user_integrations[type] &&
          parseInt(this.$store.state.auth.team_integrations[type].user_oauth_int_id) == parseInt(this.$store.state.auth.user_integrations[type].id)
        )
      },

      bulkImportSelectRepo(repoRecord) {
        this.github.bulk.repo = repoRecord.name
      },

      startGithubBulkImport() {
        const toast = SnackbarFactory(this)

        if (!this.github.bulk.entityTypeId)
          return toast.open(`Please enter a valid entity type to classify the records being bulk imported.`, 'error')

        this.github.bulk.isProcessing = true
        EuphoritechSocket.emit('githubBulkRecordImportStart', { org: this.github.org, repo: this.github.bulk.repo, entityTypeId: this.github.bulk.entityTypeId })
        toast.open(`Starting your bulk import now!`)
      },

      startSalesforceBulkImport({ integrationId, entityTypeId }) {
        const toast = SnackbarFactory(this)

        if (!entityTypeId)
          return toast.open(`Please enter a valid entity type to classify the records being bulk imported.`, 'error')

        this.salesforce.bulk.isProcessing = true
        EuphoritechSocket.emit('salesforceBulkRecordImportStart', { entityTypeId, integrationId })
        toast.open(`Starting your bulk import now!`)
      },

      async selectGithubOrg(repoInfo) {
        if (repoInfo.login === true) {
          const res = await ApiIntegrations.githubGetUserProfile()
          return this.github = Object.assign(this.github, {
            org: res.profile.login,
            orgType: 'user'
          })
        }
        this.github.org = repoInfo.login
      },

      async useUserIntegration(type, onlyUpdateOrg=true) {
        const toast = SnackbarFactory(this)

        let requestObject = { type }
        switch(type) {
          case 'github':
            requestObject = Object.assign(requestObject, {
              org: this.github.org,
              orgType: this.github.orgType,
              onlyUpdateOrg
            })
            break

          case 'salesforce':
            // TODO: Determine if other data will be passed and add it here
            break
        }

        const response = await ApiIntegrations.saveTeamIntegration(requestObject)
        toast.open(`Starting your bulk import now!`)
      }
    },

    async created() {
      this.bindSocketEvents()

      const [ envHasGithub, envHasSfdc, envHasZendesk, entityTypes ] = await Promise.all([
        ApiEnv.hasIntegration('github'),
        ApiEnv.hasIntegration('salesforce'),
        ApiEnv.hasIntegration('zendesk'),
        ApiEntities.getTypes()
      ])
      this.env.hasGithub  = envHasGithub
      this.env.hasSfdc    = envHasSfdc
      this.env.hasZendesk = envHasZendesk

      this.entityTypes = entityTypes.types.filter(t => !!t.is_active)
        .map(t => ({ value: t.id, text: t.name }))
        .sort((t1, t2) => (t1.text.toLowerCase() < t2.text.toLowerCase()) ? -1 : 1)

      this.team.hasGithub = !!this.$store.state.auth.team_integrations.github
      this.user.hasGithub = !!this.$store.state.auth.user_integrations.github

      this.team.hasSfdc = !!this.$store.state.auth.team_integrations.salesforce
      this.user.hasSfdc = !!this.$store.state.auth.user_integrations.salesforce

      this.github = Object.assign(this.github, (this.$store.state.auth.team_integrations && this.$store.state.auth.team_integrations.github)
        ? { org: this.$store.state.auth.team_integrations.github.mod1, orgType:  this.$store.state.auth.team_integrations.github.mod2 }
        : this.github)

      this.isLoadingLocal = false
    },

    components: {
      OauthButton,
      IntegrationsSalesforceObjects
    }
  }
</script>
