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
                th Active/Inactive
            tbody
              tr(v-for="(entity, ind) in sortedTypes",:class="isInactiveTypeRowClass(entity.is_active)")
                td {{ ind + 1 }}.
                td
                  strong {{ entity.name }}
                td {{ entity.description }}
                td
                  i
                    a(:id="'update-active-status-' + entity.id",href="javascript:void(0)",@click="updateTypeRecordStatus(entity)") {{ getActiveStatus(entity.is_active) }}
                    b-tooltip(:target="'update-active-status-' + entity.id",:title="'Click here to ' + getActiveStatus(entity.is_active, true) + ' this record type. This will allow or disallow records from being linked to this type in the future.'")
        b-col(cols="12")
          hr
          div
            a(href="javascript:void(0)",@click="showCreateTypeForm = !showCreateTypeForm") Create New Record Type
          b-row(v-if="showCreateTypeForm")
            b-col(cols="12",md="4")
              b-row
                b-col(cols="12")
                  b-form-group(label="Name")
                    b-form-input(type="text",v-model="newType.name",size="sm")
                b-col(cols="12")
                  b-form-group(label="Description")
                    b-form-input(type="text",v-model="newType.description",size="sm")
                b-col.text-center(cols="12")
                  b-button(variant="primary",@click="saveNewRecordType") Create New Type
</template>

<script>
  import ApiEntities from '../../factories/ApiEntities'
  import ApiTeams from '../../factories/ApiTeams'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        isLoadingLocal: true,
        showCreateTypeForm: false,
        entityTypes: [],

        newType: {
          name: null,
          description: null
        }
      }
    },

    computed: {
      sortedTypes() {
        return this.entityTypes.sort((a, b) => {
          if (a.is_active && !b.is_active)
            return -1
          if (b.is_active && !a.is_active)
            return 1

          return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1
        })
      }
    },

    methods: {
      getActiveStatus(isActive, getVerbToChange=false) {
        let mapForWords = { active: 'Active', inactive: 'Inactive' }
        if (getVerbToChange)
          mapForWords = { active: 'deactivate', inactive: 'activate' }
        return (isActive) ? mapForWords.active : mapForWords.inactive
      },

      isInactiveTypeRowClass(isActive) {
        return (!isActive) ? 'inactive-type-row' : ''
      },

      async updateTypeRecordStatus(entity) {
        try {
          const newIsActiveStatus = !entity.is_active
          await ApiEntities.updateType({ id: entity.id, is_active: newIsActiveStatus })
          entity.is_active = newIsActiveStatus
          SnackbarFactory(this).open("Successfully updated status!")

        } catch(err) {
          console.log(`Error updating status`, err)
          SnackbarFactory(this).open(err.message, 'error')
        }
      },

      async saveNewRecordType() {
        const toast = SnackbarFactory(this)
        if (!this.newType.name)
          return toast.open('Please enter a name for the record type to create.', 'error')

        this.isLoadingLocal = true
        await ApiEntities.createType(this.newType.name, this.newType.description)
        this.entityTypes = (await ApiTeams.getTeamEntityTypes()).types
        this.isLoadingLocal = false
        toast.open("Successfully saved new record type!")
      }
    },

    async created() {
      this.entityTypes = (await ApiTeams.getTeamEntityTypes()).types
      this.isLoadingLocal = false
    }
  }
</script>

<style scoped>
  .inactive-type-row {
    color: #c0c0c0;
  }
</style>
