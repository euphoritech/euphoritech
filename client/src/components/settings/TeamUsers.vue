<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-row
        b-col(v-if="teamHasUsers",cols="12")
          table.table
            thead
              tr
                th #
                th Name
                th Email
                th Date Added
            tbody
              tr(v-for="(user, ind) in users")
                td {{ ind + 1 }}.
                td {{ user.name }}
                td {{ user.username_email }}
                td {{ getFormattedDate(user.created_at) }}
        b-col(v-if="!teamHasUsers",cols="12")
          b-alert(:show="true",variant="warning") There are no users in your team yet.
</template>

<script>
  import ApiTeams from '../../factories/ApiTeams'
  import TimeHelpers from '../../factories/TimeHelpers'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        users: []
      }
    },

    computed: {
      teamHasUsers() {
        return this.users.length > 0
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,

      inviteUser() {

      }
    },

    async created() {
      this.users = (await ApiTeams.getUsersInLoggedInTeam()).users
      this.isLoadingLocal = false
    }
  }
</script>
