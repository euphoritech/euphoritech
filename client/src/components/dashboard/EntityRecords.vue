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
          th
      tbody
        tr(v-for="(record, ind) in records")
          td {{ ind + 1 }}.
          td {{ record.name }}
          td {{ truncateString(record.description, 200) }}
          td {{ record.source }}
          td {{ record.uid }}
          td {{ (record.due_date) ? getFormattedDate(record.due_date) : 'No Due Date' }}
          td
            a.cog(:id="'edit-record-' + ind",href="javascript:void(0)")
              i.fa.fa-cog
            b-popover(ref="edit-popover",:target="'edit-record-' + ind",title="Edit")
              div Change record type:
              b-form-select(size="sm",:options="typeOptions",v-model="currentTypeId",@change.native="changeEntityType(record.id, ind)")
</template>

<script>
  import StringHelpers from '../../factories/StringHelpers'
  import TimeHelpers from '../../factories/TimeHelpers'
  import ApiEntities from '../../factories/ApiEntities'

  export default {
    props: {
      records: { type: Array, default: [] },
      type_id: { type: [ Number, String ] }
    },

    data() {
      return {
        type: {},
        currentTypeId: null,
        typeOptions: []
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,
      truncateString: StringHelpers.truncateString,

      changeEntityType(entityId, ind) {
        // TODO: remove after the following issue is fixed:
        // https://github.com/bootstrap-vue/bootstrap-vue/issues/1772
        setTimeout(async () => {
          await ApiEntities.updateEntity({ id: entityId, entity_type_id: this.currentTypeId })
          this.closeEntityEditPopover(ind)
          this.currentTypeId = this.type_id
          this.$emit('changeEntityType', entityId)
        }, 100)
      },

      toggleCreateEntityModal() {
        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL')
      },

      closeEntityEditPopover(ind) {
        this.$refs['edit-popover'][ind].$emit('close')
      }
    },

    created() {
      this.type = this.$store.state.session.current_team_types.find(t => t.id === parseInt(this.type_id))
      this.currentTypeId = parseInt(this.type_id)
      this.typeOptions = this.$store.state.session.current_team_types
        .filter(f => !!f.is_active)
        .sort((t1, t2) => (t1.name.toLowerCase() > t2.name.toLowerCase()) ? 1 : -1)
        .map(f => ({ text: f.name, value: f.id }))
    }
  }
</script>

<style scoped>
  td {
    vertical-align: middle;
  }

  a.cog {
    color: inherit;
  }
</style>
