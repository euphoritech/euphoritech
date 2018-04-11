<template>
  <b-modal id="create-entity-modal" ref="createEntityModal" v-model="$store.state.showEntityModal" size="lg" centered title="Create Record">
    <b-row>
      <b-col class="d-none d-md-block" cols="12">
        Yay the create entity form!
      </b-col>
    </b-row>
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
  // import ApiKeys from './ApiKeys'

  export default {
    data() {
      return {

      }
    },

    methods: {

    }
  }
</script>
