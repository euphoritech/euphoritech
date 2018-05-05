<template lang="pug">
  b-col(cols="3")
    div.max-300
      b-row
        b-col.no-gutter
          b-list-group
            b-list-group-item(:class="isActiveClass(null, true)",href="/dashboard/home") Home
          div.side-nav-title
            strong
              u Record Types
      b-row
        b-col.side-nav
          b-list-group-item(:class="isActiveClass(type.id)",:href="'/dashboard/type/' + type.id",v-for="type in typesSorted",:key="type.id") {{ type.name }}
</template>

<script>
  export default {
    props: {
      activeTypeId: { type: [ Number, String ], default: null }
    },

    computed: {
      typesSorted() {
        return this.$store.state.session.current_team_types.sort((t1, t2) => {
          return (t1.name.toLowerCase() > t2.name.toLowerCase()) ? 1 : -1
        })
      }
    },

    methods: {
      isActiveClass(id, isHome=false) {
        if (isHome)
          return (!this.activeTypeId) ? 'active' : ''

        return (parseInt(this.activeTypeId) === id) ? 'active' : ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .side-nav-title {
    border-right: 1px solid rgba(0, 0, 0, 0.125);
    padding: 0.75rem 1.25rem
  }

  .list-group-item:first-child,
  .list-group-item:last-child {
    border-radius: 0
  }

  .no-gutter {
    padding: 0px;
  }
</style>
