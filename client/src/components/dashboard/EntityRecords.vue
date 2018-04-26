<template lang="pug">
  b-col
    b-alert.text-center(:show="records.length === 0",variant="warning")
      div.text-large
        span There are no records of type: {{ type.name }}.&nbsp;
        a(href="javascript:void(0)",@click.prevent="toggleCreateEntityModal") Click Here
        span  to add one.
    table.table(v-if="records.length > 0")
      thead
        tr
          th #
          th Name
          th Description
          th Source
          th Unique ID
          th Due Date
      tbody
        tr(v-for="(record, ind) in records")
          td {{ ind + 1 }}.
          td {{ record.name }}
          td {{ record.description }}
          td {{ record.source }}
          td {{ record.uid }}
          td {{ (record.due_date) ? getFormattedDate(record.due_date) : 'No Due Date' }}
</template>

<script>
  import TimeHelpers from '../../factories/TimeHelpers'

  export default {
    props: {
      records: { type: Array, default: [] },
      type_id: { type: [ Number, String ] }
    },

    data() {
      return {
        type: {}
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,

      toggleCreateEntityModal() {
        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL')
      }
    },

    created() {
      this.type = this.$store.state.session.current_team_types.find(t => t.id === parseInt(this.type_id))
    }
  }
</script>
