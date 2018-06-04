<template lang="pug">
  b-container(:fluid="true")
    b-row
      side-bar(:active-type-id="this.type_id")
      b-col
        b-container(style="margin-left:inherit")
          b-alert.margin-top-medium(:show="error",variant="danger") {{ error }}
          b-row
            b-col(v-if="isLoadingLocal")
              loader
            component.padding-medium(:is="partialComponent",v-bind="currentComponentProps",@changeEntityTypeOrRemove="removeEntity",@changePage="changePage",@searchForRecords="recordSearch",v-if="!isLoadingLocal")
</template>

<script>
  import Entity from './Entity'
  import EntityRecords from './EntityRecords'
  import Home from './Home'
  import SideBar from './SideBar'
  import ApiEntities from '../../../factories/ApiEntities'

  export default {
    props: {
      id: { type: [ Number, String ], default: null },
      type_id: { type: [ Number, String ], default: null }
    },

    data() {
      return {
        error: null,
        isLoadingLocal: true,
        partialComponent: null,
        recordInfo: {},
      }
    },

    computed: {
      currentComponentProps() {
        switch (this.partialComponent) {
          case 'entity-records':
            return { data: this.recordInfo, type_id: this.type_id }
          case 'entity':
            return { id: this.id }
        }
      }
    },

    methods: {
      async changePage(searchTerm, newPage) {
        if (searchTerm)
          return this.recordInfo = (await ApiEntities.search({ type_id: this.type_id, search: searchTerm, page: newPage })).info

        this.recordInfo = (await ApiEntities.getEntityListByType({ type_id: this.type_id, page: newPage })).info
      },

      async recordSearch(search) {
        this.recordInfo = (await ApiEntities.search({ type_id: this.type_id, page: 1, search })).info
      },

      removeEntity(id) {
        this.recordInfo.data = this.recordInfo.data.filter(r => r.id !== id)
      }
    },

    components: {
      Entity,
      EntityRecords,
      Home,
      SideBar
    },

    async created() {
      if (this.$route.query && (this.$route.query.error || this.$route.query.error_code))
        this.error = `${this.$route.query.error_code || 'N/A'} - ${this.$route.query.error || 'No more details'}`

        if (this.id) {
          this.partialComponent = 'entity'
          return this.isLoadingLocal = false
        }

      if (this.type_id) {
        this.recordInfo = (await ApiEntities.getEntityListByType({ type_id: this.type_id })).info
        this.partialComponent = 'entity-records'
        return this.isLoadingLocal = false
      }

      this.partialComponent = 'home'
      this.isLoadingLocal = false
    }
  }
</script>
