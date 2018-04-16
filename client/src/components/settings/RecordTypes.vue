<template lang="pug">
  div
    div(v-if="isLoadingLocal")
      loader
    div(v-if="!isLoadingLocal")
      b-row
        b-col(cols="12")
          table.table
            thead
              tr
                th #
                th Name
                th Description
                th Remove
            tbody
              tr(v-for="(entity, ind) in sortedTypes")
                td {{ ind + 1 }}.
                td
                  strong {{ entity.name }}
                td {{ entity.description }}
                td
                  i
                    a(href="#") remove
</template>

<script>
  import ApiTeams from '../../factories/ApiTeams'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        entityTypes: []
      }
    },

    computed: {
      sortedTypes() {
        return this.entityTypes.sort((a, b) => {
          return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1
        })
      }
    },

    methods: {

    },

    async created() {
      this.entityTypes = (await ApiTeams.getTeamEntityTypes()).types
      this.isLoadingLocal = false
    }
  }
</script>
