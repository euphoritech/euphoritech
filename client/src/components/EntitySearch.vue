<template lang="pug">
  typeahead-input.margin-bottom-small(src="/api/1.0/entities/search",:params="{ keysFromResponse: 'info.data', showPropFunction: parseEntitySearchItem, minChars: 3, limit: 25 }",@onHit="select")
</template>

<script>
  export default {
    methods: {
      select(entity) {
        this.$emit('select', entity)
      },

      getEntityType(id) {
        return this.$store.state.session.current_team_types.find(t => t.id == id)
      },

      parseEntitySearchItem(item) {
        return `${item.name} (${this.getEntityType(item.entity_type_id).name})`
      }
    }
  }
</script>
