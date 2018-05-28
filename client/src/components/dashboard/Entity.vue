<template lang="pug">
  b-col
    loader(v-if="isLoadingLocal")
    div(v-if="!isLoadingLocal")
      b-alert(:show="!!error",variant="warning") {{ error }}
      b-row(v-if="!error")
        b-col(cols="12")
          h2(style="border-bottom: 1px #f0f0f0 solid") {{ truncateString(entityRecord.name, 40) }}
        b-col(cols="12",md="7")
          b-row
            b-col(cols="12",md="3")
              strong Source:
            b-col(cols="12",md="9") {{ entityRecord.source }}
          b-row(v-for="(string, col) in $store.state.dataLabelMaps.github",:key="col")
            b-col(cols="12",md="3")
              strong {{ $store.state.dataLabelMaps[entityRecord.source][col] }}:
            b-col(cols="12",md="9") {{ truncateString(entityRecord[col], 50) }}
        b-col(cols="12",md="5")
          h5 Records Linked ({{ links.length }})
          div
            small Add record link:
          typeahead-input.margin-bottom-small(src="/api/1.0/entities/search",:params="{ keysFromResponse: 'info.data', showProp: 'name', minChars: 3 }",@onHit="createLink")
          table.table.very-thin.table-striped.table-bordered(v-if="links.length > 0")
            thead
              tr
                th #
                th Source
                th Name
            tbody
              tr(v-for="(link, ind) in links",:key="link.id")
                td {{ ind+1 }}
                td {{ link.source }}
                td
                  a(:href="'/dashboard/entity/' + link.id") {{ truncateString(link.name, 30) }}
          b-alert(:show="links.length === 0",variant="warning") There are no other records linked to this one yet.
</template>

<script>
  import ApiEntities from '../../factories/ApiEntities'
  import StringHelpers from '../../factories/StringHelpers'
  import TimeHelpers from '../../factories/TimeHelpers'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    props: {
      id: { type: [ Number, String ] }
    },

    data() {
      return {
        isLoadingLocal: true,
        entityRecord: null,
        links: [],
        error: null
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,
      truncateString: StringHelpers.truncateString,

      async createLink(record) {
        await ApiEntities.createLink(this.id, record.id)
        this.links = (await ApiEntities.getLinkedEntities(this.id)).records
      }
    },

    async created() {
      try {
        const responses = await Promise.all([
          ApiEntities.get(this.id),
          ApiEntities.getLinkedEntities(this.id)
        ])
        this.entityRecord = responses[0].record
        this.links = responses[1].records
      } catch(err) {
        this.error = err.message
      } finally {
        this.isLoadingLocal = false
      }
    }
  }
</script>
