<template lang="pug">
  b-col
    b-alert(:show="!!error",variant="warning") {{ error }}
    div(v-if="!error")
      h2 {{ truncateString(entityRecord.name, 30) }}
      div This is an entity - ID: {{ id }}
</template>

<script>
  import ApiEntities from '../../factories/ApiEntities'
  import StringHelpers from '../../factories/StringHelpers'
  import SnackbarFactory from '../../factories/SnackbarFactory'

  export default {
    props: {
      id: { type: [ Number, String ] }
    },

    data() {
      return {
        entityRecord: null,
        error: null
      }
    },

    methods: {
      truncateString: StringHelpers.truncateString,
    },

    async created() {
      try {
        this.entityRecord = (await ApiEntities.get(this.id)).record
      } catch(err) {
        this.error = err.message
      }
    }
  }
</script>
