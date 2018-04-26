<template>
  <b-modal id="create-entity-modal" ref="createEntityModal" v-model="$store.state.showEntityModal" size="lg" centered title="Create Record">
    <b-row>
      <b-col class="d-none d-md-block" cols="12">
        <b-form @submit="createRecord">
          <b-form-group label="Record Type">
            <b-form-select v-model="entityData.entityTypeId" :options="entityTypes" placeholder="Select a record type to create." />
          </b-form-group>
          <hr class="separate-vert-large" />
          <b-form-group label="Name">
            <b-form-input v-model="entityData.name" />
          </b-form-group>
          <b-form-group label="Due/Delivery Date">
            <datepicker v-model="entityData.dueDate"></datepicker>
          </b-form-group>
          <b-form-group id="entity-uid" label="Unique ID (optional)">
            <b-form-input v-model="entityData.uid" />
          </b-form-group>
          <b-tooltip target="entity-uid" title="If you'd like to assign this a unique identifier of some sort, enter that here."></b-tooltip>
          <b-form-group label="Description">
            <b-form-textarea v-model="entityData.description" rows="3"></b-form-textarea>
          </b-form-group>
          <div class="text-center">
            <b-button type="submit" size="lg" variant="primary">Create Record</b-button>
          </div>
        </b-form>
      </b-col>
    </b-row>
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
  import ApiEntities from '../../factories/ApiEntities'
  import SnackbarFactory from '../../factories/SnackbarFactory'
  import EuphoritechSocket from '../../factories/EuphoritechSocket'

  export default {
    props: {
      loggedIn: { type: Boolean, default: false }
    },

    data() {
      return {
        entityTypes: [],
        initData: null,
        entityData: {
          source: 'manual',
          entityTypeId: null,
          dueDate: null,
          name: null,
          description: null,
          uid: null
        }
      }
    },

    methods: {
      async createRecord(e) {
        e.preventDefault()

        await ApiEntities.createEntity(this.entityData)

        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL')
        this.resetData()
        SnackbarFactory(this).open(`Successfully created a new ${this.getSelectedType()}!`)
      },

      getSelectedType() {
        return this.entityTypes.find(f => f.value === this.entityData.entityTypeId).text
      },

      resetData() {
        this.entityData = Object.assign({}, this.initData)
      },

      socketHandlers() {
        // EuphoritechSocket.on('clientReceivePullRequests', function clientReceivePullRequests({ results }) {
        //   console.log("GOT PRS", results)
        // })
        //
        // EuphoritechSocket.emit('serverFetchPullRequests')
      }
    },

    watch: {
      async loggedIn(newVal, oldVal) {
        if (!!newVal) {
          this.entityTypes = (await ApiEntities.getTypes()).types
          .map(t => ({ value: t.id, text: t.name }))
          .sort((t1, t2) => (t1.text.toLowerCase() < t2.text.toLowerCase()) ? -1 : 1)

          this.entityData.entityTypeId = this.entityTypes[0].value
          this.initData = this.initData || Object.assign({}, this.entityData, { entityTypeId: this.entityData.entityTypeId })

          this.socketHandlers()
        }
      }
    }
  }
</script>
