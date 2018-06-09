<template lang="pug">
  div.container
    h1 Leaderboard
    entity-search(@select="recordSelect")
    hr
    div.text-danger(v-if="!hasSavedLeaderboard")
      small
        i.
          You have not created a leaderboard yet so the records below were
          pulled based on the number of records that are linked to them. Once
          you save your leaderboard, those records will be pulled from that point
          forward.
    table.table
      thead
        tr
          th #
          th Record
          th Added
          th Number of Records Linked
      tbody
        tr(v-for="(record, ind) in entities")
          td {{ ind + 1 }}
          td
            i.margin-right-small(:class="vendorClass(record.source)")
            span {{ record.name }}
          td {{ getFormattedDate(record.created_at) }}
          td {{ record.link_count }}
</template>

<script>
  import EntitySearch from '../EntitySearch'
  import ApiEntities from '../../factories/ApiEntities'
  import TimeHelpers from '../../factories/TimeHelpers'
  import { vendorClass } from '../../factories/IconHelpers'

  export default {
    data() {
      return {
        hasSavedLeaderboard: false,
        entities: []
      }
    },

    methods: {
      vendorClass,
      getFormattedDate: TimeHelpers.getFormattedDate,

      async recordSelect(record) {
        console.log("RECORD", record)
      }
    },

    async created() {
      const info = await ApiEntities.getLeaderboard()
      this.hasSavedLeaderboard = info.hasLeaderboard
      this.entities = info.records
    },

    components: {
      EntitySearch
    }
  }
</script>
