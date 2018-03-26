<template lang="pug">
  div.container.margin-top-large
    div(v-if="localIsLoading")
      loader
    div.row.d-flex.justify-content-center(v-if="!localIsLoading")
      div.col-xs-12.col-sm-8.col-sm-offset-2.col-lg-6.col-lg-offset-3
        h1 Create or Join Team
        b-card.shadow-small
          div.card-text
            b-form(@submit="joinExistingTeam")
              h4 Join Existing Team
              b-form-group(label-for="jteam")
                b-form-input(id="jteam",name="jteam",v-model="data.teamIdToJoin",placeholder="Team ID")
              div.text-center
                b-button(variant="primary",type="submit",class="btn btn-default") Request Access
              b-alert.margin-medium(variant="warning",:show="!!joinError") {{ joinError }}
              b-alert.margin-medium(variant="success",:show="joinSuccess").
                Successfully requested access to team ID: {{ data.teamIdToJoin }}.
                You will receive an e-mail once the request is acted on by the
                team administrator.
            hr
            b-form(@submit="createNewTeam")
              h4 Create New Team
              b-form-group(label-for="nteamid")
                b-form-input(id="nteamid",name="nteamid",v-model="data.teamIdToCreate",placeholder="New Team ID (5-8 alphanumeric characters)")
              b-form-group(label-for="nteamname")
                b-form-input(id="nteamname",name="nteamname",v-model="data.teamNameToCreate",placeholder="New Team Name")
              div.text-center
                b-button(variant="success",type="submit",class="btn btn-default") Create New Team
              b-alert.margin-medium(variant="warning",:show="!!newTeamError") {{ newTeamError }}
</template>

<script>
  import ApiTeams from '../factories/ApiTeams'

  export default {
    data() {
      return {
        localIsLoading: true,

        data: {
          teamIdToJoin: '',
          teamIdToCreate: '',
          teamNameToCreate: ''
        },
        joinError: null,
        joinSuccess: false,
        newTeamError: null
      }
    },

    methods: {
      async createNewTeam(evt) {
        evt.preventDefault()

        if (!(this.data.teamIdToCreate && this.validTeamId(this.data.teamIdToCreate)))
          return this.newTeamError = `Please enter a valid team ID of 5-8 alphanumeric characters to create a new team.`

        if (!this.data.teamNameToCreate)
          return this.newTeamError = `Please enter a name for the new team you want to create.`

        await ApiTeams.newTeam({ teamId: this.data.teamIdToCreate, teamName: this.data.teamNameToCreate })
        this.$store.dispatch('redirectToHome')
      },

      async joinExistingTeam(evt) {
        evt.preventDefault()

        if (!(this.data.teamIdToJoin && this.validTeamId(this.data.teamIdToJoin)))
          return this.joinError = `Please enter a valid team ID to request access to join the team.`

        try {
          await ApiTeams.requestJoinTeam({ teamId: this.data.teamIdToJoin })
          this.joinSuccess = true
          setTimeout(() => this.$router.go(this.$router.currentRoute), 2500)
        } catch(err) {
          this.joinError = err.message
        }
      },

      validTeamId(id='') {
        if (/^[a-z\d]{5,8}$/.test(id.toLowerCase()))
          return true

        return false
      }
    },

    async created() {
      // TODO: make backend call to see if there are any currently
      // pending requests to join a team and show a message if so instead
      // of the current form
      this.localIsLoading = false
    }
  }
</script>
