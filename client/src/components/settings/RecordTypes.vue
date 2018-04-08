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
                th External Name
                th Internal Name
                th Description
                th Remove
            tbody
              tr(v-for="(entity, ind) in sortedTypes")
                td {{ ind + 1 }}.
                td
                  strong {{ entity.external_type }}
                td {{ entity.internal_type }}
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
          return (a.external_type.toLowerCase() < b.external_type.toLowerCase()) ? -1 : 1
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
