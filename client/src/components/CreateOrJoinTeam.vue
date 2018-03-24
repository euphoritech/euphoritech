<template lang="pug">
  div.container.margin-top-large
    div.row.d-flex.justify-content-center
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
              b-alert.margin-medium(variant="warning",:show="joinError") {{ joinError }}
            hr
            b-form(@submit="createNewTeam")
              h4 Create New Team
              b-form-group(label-for="nteamid")
                b-form-input(id="nteamid",name="nteamid",v-model="data.teamIdToCreate",placeholder="New Team ID (5-8 alphanumeric characters)")
              b-form-group(label-for="nteamname")
                b-form-input(id="nteamname",name="nteamname",v-model="data.teamNameToCreate",placeholder="New Team Name")
              div.text-center
                b-button(variant="success",type="submit",class="btn btn-default") Create New Team
              b-alert.margin-medium(variant="warning",:show="newTeamError") {{ newTeamError }}
</template>

<script>
  import ApiTeams from '../factories/ApiTeams'

  export default {
    data() {
      return {
        data: {
          teamIdToJoin: '',
          teamIdToCreate: '',
          teamNameToCreate: ''
        },
        joinError: null,
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

      joinExistingTeam(evt) {
        if (!(this.data.teamIdToCreate && this.validTeamId(this.data.teamIdToCreate)))
          return this.joinError = `Please enter a valid team ID to request access to join the team.`

        console.log('valid join info')
      },

      validTeamId(id='') {
        if (/[a-z\d]{5,8}/.test(id.toLowerCase()))
          return true

        return false
      }
    }
  }
</script>
