<template lang="pug">
  b-navbar(toggleable="md",type="dark",variant="dark")
    b-navbar-toggle(target="nav_collapse")
    b-navbar-brand(href="/") euphoritech
    b-collapse(:is-nav="true",id="nav_collapse")
      //- b-navbar-nav
      //-   b-nav-item(href="/") Home
      b-navbar-nav(class="ml-auto")
        //- b-form-input.mr-sm-2(size="sm",placeholder="Search..")
        b-nav-item(v-if="!isLoggedIn",href="/login") Login
        b-nav-item(id="create-entity-modal",v-if="isLoggedIn",@click="showCreateEntityModal")
          i.fa.fa-plus-square
        b-tooltip(target="create-entity-modal",title="Create a new record to link to.")
        b-nav-item(id="chat-widget-toggle",v-if="isLoggedIn",@click="toggleChatWidget")
          i.fa.fa-comments(:class="activeClass($store.state.chatWidget.isOpen)")
        b-tooltip(target="chat-widget-toggle",title="Show the chat widget to chat with team members.")
        b-nav-item(id="show-settings",v-if="isLoggedIn",@click="toggleSettings")
          i.fa.fa-cog
        b-tooltip(target="show-settings",title="Access & update your settings.")
        b-nav-item(v-if="isLoggedIn",href="/logout") Logout
</template>

<script>
  import moment from 'moment'
  import ApiAuth from '../factories/ApiAuth'

  export default {
    computed: {
      isLoggedIn() {
        return this.$store.state.isLoggedIn
      }
    },

    methods: {
      activeClass(bool) {
        return (!!bool) ? 'text-success' : ''
      },

      showCreateEntityModal() {
        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL', this.$store.state.session.current_team_types.reduce((f, t) => {
          if (!f) return t.id
          if (t.id < f) return t.id
          return f
        }))
      },

      toggleChatWidget() {
        this.$store.commit('TOGGLE_CHAT_WIDGET')
      },

      async toggleSettings() {
        await this.$store.dispatch('toggleSettingsModal')
      }
    }
  }
</script>
