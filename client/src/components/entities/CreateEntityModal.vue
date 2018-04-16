<template>
  <b-modal id="create-entity-modal" ref="createEntityModal" v-model="$store.state.showEntityModal" size="lg" centered title="Create Record">
    <b-row>
      <b-col class="d-none d-md-block" cols="12">
        <b-form @submit="createRecord">
          <b-form-group label="Record Type">
            <b-form-select v-model="data.entityType" :options="entityTypes" placeholder="Select a record type to create." />
          </b-form-group>
          <hr class="separate-vert-large" />
          <b-form-group label="Name">
            <b-form-input v-model="data.name" />
          </b-form-group>
          <b-form-group label="Due/Delivery Date">
            <datepicker v-model="data.dueDate"></datepicker>
          </b-form-group>
          <b-form-group id="entity-uid" label="Unique ID (optional)">
            <b-form-input v-model="data.uid" />
          </b-form-group>
          <b-tooltip target="entity-uid" title="If you'd like to assign this a unique identifier of some sort, enter that here."></b-tooltip>
          <b-form-group label="Description">
            <b-form-textarea v-model="data.description" rows="3"></b-form-textarea>
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

  export default {
    data() {
      return {
        entityTypes: [],
        data: {
          entityType: null,
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
        console.log("DATA", this.data)
      }
    },

    async created() {
      this.entityTypes = (await ApiEntities.getTypes()).types
      .map(t => ({ value: t.id, text: t.name }))
      .sort((t1, t2) => (t1.text.toLowerCase() < t2.text.toLowerCase()) ? -1 : 1)

      this.data.entityType = this.entityTypes[0].value
    }
  }
</script>
