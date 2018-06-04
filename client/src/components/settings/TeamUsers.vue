<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-row
        b-col.margin-bottom-medium(cols="12")
          div
            a(href="javascript:void(0)",@click="showInviteUserForm = !showInviteUserForm") Invite New User
          b-row
            b-col(cols="12",md="4")
              b-card.subtle-bg(v-if="showInviteUserForm",:no-body="true")
                b-card-body
                  b-row
                    b-col(cols="12")
                      b-form-group(label="User's Name")
                        b-form-input(type="text",v-model="newUser.name",size="sm")
                    b-col(cols="12")
                      b-form-group(label="User's Email")
                        b-form-input(type="text",v-model="newUser.email",size="sm")
                    b-col.text-center(cols="12")
                      b-button(variant="primary",@click="inviteUser") Invite User
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
  import ApiAuth from '../../factories/ApiAuth'
  import ApiTeams from '../../factories/ApiTeams'
  import TimeHelpers from '../../factories/TimeHelpers'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        showInviteUserForm: false,
        users: [],

        newUser: {
          name: null,
          email: null
        }
      }
    },

    computed: {
      teamHasUsers() {
        return this.users.length > 0
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,

      async inviteUser() {
        const toast = SnackbarFactory(this)

        if (!this.newUser.name)
          return toast.open(`Please enter at least the user's first name in the name field.`, 'error')

        if (!ApiAuth.isValidEmail(this.newUser.email))
          return toast.open(`Please enter a valid e-mail address for the new user and try again.`, 'error')

        if (!(await ApiAuth.checkUsernameAvailability(this.newUser.email)))
          return toast.open(`The e-mail entered has already been registered. Please confirm you entered the correct email address or try to login.`, 'error')

        console.log("USER", this.newUser)
        toast.open('Success!')
      }
    },

    async created() {
      this.users = (await ApiTeams.getUsersInLoggedInTeam()).users
      this.isLoadingLocal = false
    }
  }
</script>
