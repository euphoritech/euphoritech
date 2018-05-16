<template lang="pug">
  div
    div(v-if="!selectedIntegration")
      div Find an object to search in:
      typeahead-input(:params="{ src: '/api/1.0/integrations/salesforce/team/objects/get', keysFromResponse: 'records', showProp: 'object_name', minChars: 1 }",@onHit="selectInt")
    div(v-if="selectedIntegration")
      div
        div Enter a search term to find a record to import:
        div
          strong {{ selectedIntegration.object_name }}
          i.margin-left-small.fa.fa-times(style="color: red; cursor: pointer;",@click="selectedIntegration = null")
        typeahead-input(:params="{ src: '/api/1.0/integrations/salesforce/records/get?int_id=' + selectedIntegration.id, keysFromResponse: 'records', showProp: 'Name', minChars: 3 }",@onHit="selectRecord")
</template>

<script>
  import ApiIntegrations from '../../factories/ApiIntegrations'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    data() {
      return {
        selectedIntegration: null
      }
    },

    methods: {
      selectInt(int) {
        this.selectedIntegration = int
      },

      async selectRecord(result) {
        const entityData = Object.assign(
          { source: 'salesforce' },
          Object.keys(this.selectedIntegration.attribute_info).reduce((obj, attr) => {
            if (this.selectedIntegration.attribute_info[attr])
              obj[ attr ] = result[ this.selectedIntegration.attribute_info[attr] ]

            return obj
          }, {})
        )

        this.$emit("setEntityData", entityData)
      }
    }
  }
</script>
