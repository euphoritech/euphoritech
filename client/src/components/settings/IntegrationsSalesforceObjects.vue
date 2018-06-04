<template lang="pug">
  div
    b-alert(:show="objectTeamIntegrations.length === 0",variant="warning")
      span There are no Salesforce object integrations yet.
    b-row.margin-top-medium(v-if="objectTeamIntegrations.length > 0")
      b-col(cols="12")
        h5
          span Current Integrations
          //- loader-inline(v-if="salesforce.bulk.numImported === -1")
          //- b-badge.margin-left-small(v-if="salesforce.bulk.numImported && salesforce.bulk.numImported > 0",variant="primary",:pill="true") {{ salesforce.bulk.numImported }} processed
        table.table.thin.table-bordered.table-striped
          thead
            tr
              th SFDC Object
              th Attributes
              th Edit
              th Mass Import
          tbody
            tr(v-for="(int, ind) in objectTeamIntegrations")
              td {{ int.object_name }}
              td
                b-badge.margin-left-small(v-if="sfdcField",v-for="(sfdcField, col) in int.attribute_info",variant="primary",:key="col")
                  span {{ columnKeyMap[ col ] }}: '{{ sfdcField }}'
              td
                a(href="javascript:void(0)",@click="editExistingSfdcIntegration(int)") Edit
              td
                a(:id="'mass-import-' + ind",href="javascript:void(0)") Mass Import Records
                b-popover(ref="mass-import-popover",:target="'mass-import-' + ind",title="Mass Import")
                  div
                    small Select Record Type:
                  b-form-select(size="sm",v-model="entityTypeId",:options="entityTypes",placeholder="Select a record type to assign the imported records to")
                  div.text-center.margin-top-small
                    b-button(size="sm",variant="primary",@click="bulkImport(int.id)") Import Records
    hr
    div(v-if="!current.object")
      h3
        u Add new SF object integration
      div Search for Salesforce Objects
      typeahead-input(src="/api/1.0/integrations/salesforce/objects/get",:params="{ keysFromResponse: 'objects', minChars: 1 }",@onHit="selectSfdcObject")
    div(v-if="current.object")
      b-row
        b-col(cols="12",lg="4")
          h2 {{ current.object }}
            i.remove-icon.margin-left-small.fa.fa-times(@click="clearSfdcObjectAndAttrs()")
        b-col(cols="12",lg="8")
          div Current parameters:
          b-badge.margin-left-small(v-for="(sfdcField, col) in current.fieldsMap",variant="secondary",v-if="doesCurrentDataHaveAttributeSelected(col)",:key="col") {{ columnKeyMap[col] }} - '{{ sfdcField }}'
            i.remove-icon.margin-left-small.fa.fa-times(v-if="col !== 'uid'",@click="clearSfdcAttr(col)")
          hr
          div Select a type of attribute to tie to records you create:
            strong  {{ current.object }}
            span  object:
          b-form-group
            b-form-radio-group(v-model="current.column")
              b-form-radio(v-for="(text, col) in columnKeyMap",v-if="!doesCurrentDataHaveAttributeSelected(col)",:value="col",:key="col") {{ columnKeyMap[col] }}
          div Search for an attribute in the
          typeahead-input(:src="'/api/1.0/integrations/salesforce/attributes/get?object=' + current.object",:params="{ keysFromResponse: 'attributes', minChars: 1 }",@onHit="selectSfdcAttribute")
        b-col.margin-top-medium.text-right(cols="12")
          b-button(size="lg",variant="primary",@click="saveObjectAndAttribute") Save Object and Attributes
</template>

<script>
  import ApiIntegrations from '../../factories/ApiIntegrations'
  import EuphoritechSocket from '../../factories/EuphoritechSocket'
  import StringHelpers from '../../factories/StringHelpers'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    props: {
      entityTypes: { type: Array, default: [] },
      integration: { type: Object, default: null }
    },

    data() {
      return {
        entityTypeId: null,

        columnKeyMap: {
          uid: 'Unique Identifier',
          name: 'Name',
          description: 'Description',
          external_link: 'External Link',
          due_date: 'Due Date',
          mod1: 'Extra Parameter 1',
          mod2: 'Extra Parameter 2',
          mod3: 'Extra Parameter 3',
          mod4: 'Extra Parameter 4',
          mod5: 'Extra Parameter 5'
        },

        objectTeamIntegrations: [],

        current: {
          id: null,
          object: null,
          column: null,
          fieldsMap: {
            uid: 'Id',
            name: null,
            description: null,
            external_link: null,
            due_date: null,
            mod1: null,
            mod2: null,
            mod3: null,
            mod4: null,
            mod5: null
          }
        }
      }
    },

    computed: {
      availableParamsToSelect() {
        return Object.keys(this.columnKeyMap).reduce((obj, col) => {
          if (this.current.fieldMaps[col])
            return obj

          obj[ col ] = this.columnKeyMap[ col ]
          return obj
        }, {})
      }
    },

    methods: {
      titleCase: StringHelpers.titleCase,

      doesCurrentDataHaveAttributeSelected(column) {
        return !!this.current.fieldsMap[ column ]
      },

      clearSfdcObjectAndAttrs() {
        this.selectSfdcObject(null)
        this.current.id = null
        this.current.fieldsMap = {
          uid: 'Id',
          name: null,
          description: null,
          external_link: null,
          due_date: null,
          mod1: null,
          mod2: null,
          mod3: null,
          mod4: null,
          mod5: null
        }
      },

      clearSfdcAttr(column) {
        this.current.fieldsMap[ column ] = null
      },

      selectSfdcObject(objectName) {
        this.current.object = objectName
      },

      selectSfdcAttribute(selectedAttr) {
        const toast = SnackbarFactory(this)
        if (!this.current.column)
          return toast.open("Please select an appropriate attribute type in the radio selections above to link this field to.", 'error')

        this.current.fieldsMap[ this.current.column ] = selectedAttr
        this.current.column = null
      },

      async saveObjectAndAttribute() {
        const toast = SnackbarFactory(this)
        await ApiIntegrations.saveSfdcObjectAndAttributesIntegration({
          id: this.current.id,
          object: this.current.object,
          attrs: this.current.fieldsMap
        })

        toast.open(`Successfully saved object and attributes! You can now create records from this object!`)
        this.clearSfdcObjectAndAttrs()
        this.objectTeamIntegrations = (await ApiIntegrations.getSfdcObjectsFromTeamIntegration()).records
      },

      editExistingSfdcIntegration(intRecord) {
        this.current = Object.assign(this.current, {
          id:         intRecord.id,
          object:     intRecord.object_name,
          fieldsMap:  intRecord.attribute_info
        })
      },

      bulkImport(intId) {
        this.$emit('bulkImport', { integrationId: intId, entityTypeId: this.entityTypeId })
      }
    },

    watch: {
      integration(newVal) {
        if (newVal) {
          this.editExistingSfdcIntegration(newVal)
        }
      }
    },

    async created() {
      this.objectTeamIntegrations = (await ApiIntegrations.getSfdcObjectsFromTeamIntegration()).records
    }
  }
</script>
