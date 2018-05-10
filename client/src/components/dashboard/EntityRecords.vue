<template lang="pug">
  b-col
    div.d-flex.justify-content-between
      h1 {{ type.name }}
      div.align-self-start
        a(href="javascript:void(0)",@click="$store.commit('TOGGLE_CREATE_ENTITY_MODAL', type_id)")
          small Create New {{ type.name }}
    b-alert.text-center(:show="records.length === 0",variant="warning")
      div.text-large
        span There are no records of type: {{ type.name }}.&nbsp;
        a(href="javascript:void(0)",@click.prevent="toggleCreateEntityModal") Click Here
        span  to add one.
    table.thin.table(v-if="records.length > 0")
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
          td.nowrap-ellipses.max-150.strong-text(:id="'record-name-' + ind")
            strong {{ record.name }}
            b-tooltip(:target="'record-name-' + ind") {{ record.name }}
          td.nowrap-ellipses.max-300(:id="'record-desc-' + ind") {{ record.description }}
            b-tooltip(:target="'record-desc-' + ind") {{ record.description }}
          td {{ record.source }}
          td {{ record.uid }}
          td {{ (record.due_date) ? getFormattedDate(record.due_date) : 'N/A' }}
          td
            a.cog(:id="'edit-record-' + ind",href="javascript:void(0)")
              i.fa.fa-cog
            b-popover(ref="edit-popover",:target="'edit-record-' + ind",title="Edit")
              div
                strong {{ truncateString(record.name, 20) }}
              hr(style="margin-top: 5px; margin-bottom: 5px;")
              div Change record type:
              b-form-select(size="sm",:options="typeOptions",v-model="currentTypeId",@change.native="changeEntityType(record.id, ind)")
              div.all-small-inputs Due Date
                datepicker(v-model="record.dueDate",@input="changeDueDate(record.dueDate, record.id)")
</template>

<script>
  import StringHelpers from '../../factories/StringHelpers'
  import TimeHelpers from '../../factories/TimeHelpers'
  import ApiEntities from '../../factories/ApiEntities'
  import SnackbarFactory from '../../factories/SnackbarFactory'

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

      newlineToBr(str) {
        return str.replace('\n', '<br>')
      },

      async changeDueDate(dueDate, entityId) {
        const toast = SnackbarFactory(this)
        await ApiEntities.updateEntity({ id: entityId, due_date: dueDate })
        toast.open("Successfully set due date!")
      },

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
        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL', this.type_id)
      },

      closeEntityEditPopover(ind) {
        this.$refs['edit-popover'][ind].$emit('close')
      }
    },

    created() {
      this.type = this.$store.state.session.current_team_types.find(t => parseInt(t.id) === parseInt(this.type_id)) || {}
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
