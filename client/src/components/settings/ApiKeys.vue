<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-row
        b-col(v-if="teamHasApiKeys",cols="12")
          table.table
            thead
              tr
                th #
                th API Key
                th Name
                th Description
                th Status
                th Date Added
            tbody
              tr(v-for="(key, ind) in keys")
                td {{ ind + 1 }}.
                td {{ key.api_key }}
                td {{ key.name }}
                td {{ key.description }}
                td {{ key.status }}
                td {{ getFormattedDate(key.created_at) }}
        b-col(v-if="!teamHasApiKeys",cols="12")
          b-alert(:show="true",variant="warning") There are no API keys in your team yet.
</template>

<script>
  import ApiTeams from '../../factories/ApiTeams'

  export default {
    data() {
      return {
        keys: [],
        isLoadingLocal: true
      }
    },

    computed: {
      teamHasApiKeys() {
        return this.keys.length > 0
      }
    },

    async created() {
      this.keys = (await ApiTeams.getApiKeys()).keys
      this.isLoadingLocal = false
    }
  }
</script>
