<template lang="pug">
  b-col
    loader(v-if="isLoadingLocal")
    div(v-if="!isLoadingLocal")
      b-alert(:show="!!error",variant="warning") {{ error }}
      b-row(v-if="!error")
        b-col.d-flex.justify-content-between(cols="12")
          h2
            div {{ truncateString(entityRecord.name, 40) }}
            div.soft-text(style="font-size: 12px")
              a.und-only(:href="'/dashboard/type/' + entityType.id") {{ entityType.name }}
          div.soft-text(style="font-size: 16px",v-if="entityRecord.status != 'active'") {{ titleCase(entityRecord.status) }}
        b-col(cols="12")
          hr
        b-col(cols="12",md="7")
          b-row.margin-bottom-small
            b-col(cols="12")
              h4.soft-text.no-margin Source
            b-col(cols="12")
              h4
                i.margin-right-small(:class="vendorClass(entityRecord.source)")
                span {{ titleCase(entityRecord.source) }}
          b-row.margin-bottom-small(v-for="(string, col) in $store.state.dataLabelMaps.github",:key="col",v-if="entityRecord[col] && entityRecord[col].length > 0")
            b-col(cols="12")
              h4.soft-text.no-margin {{ $store.state.dataLabelMaps[entityRecord.source][col] }}
            b-col.entity-content(cols="12")
              b-card(:no-body="true",v-if="shouldWrapInCard(entityRecord[col])")
                b-card-body(v-html="markdownToHtml(entityRecord[col])")
              div(v-if="!shouldWrapInCard(entityRecord[col])",v-html="markdownToHtml(entityRecord[col])")
        b-col(cols="12",md="5")
          h5 Records Linked ({{ links.length }})
          div
            small Add record link:
          typeahead-input.margin-bottom-small(src="/api/1.0/entities/search",:params="{ keysFromResponse: 'info.data', showPropFunction: parseEntitySearchItem, minChars: 3, limit: 25 }",@onHit="createLink")
          table.table.very-thin.table-striped.table-bordered(v-if="links.length > 0")
            thead
              tr.sortable-headers
                th #
                th(@click="toggleSort('name')")
                  span Name
                  i.margin-left-small.fa(v-if="linksSortCol == 'name'",:class="linksSortDir == 'desc' ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up'")
                th(@click="toggleSort('type')")
                  span Type
                  i.margin-left-small.fa(v-if="linksSortCol == 'type'",:class="linksSortDir == 'desc' ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up'")
                th(@click="toggleSort('source')")
                  span Source
                  i.margin-left-small.fa(v-if="linksSortCol == 'source'",:class="linksSortDir == 'desc' ? 'fa-chevron-circle-down' : 'fa-chevron-circle-up'")
            tbody
              tr(v-for="(link, ind) in sortedLinks",:key="link.id")
                td {{ ind+1 }}
                td
                  a(:href="'/dashboard/entity/' + link.id") {{ truncateString(link.name, 30) }}
                td {{ getEntityType(link.entity_type_id).name }}
                td {{ titleCase(link.source) }}
          b-alert(:show="links.length === 0",variant="warning") There are no other records linked to this one yet.
</template>

<script>
  import markdown from 'markdown'
  import ApiEntities from '../../../factories/ApiEntities'
  import StringHelpers from '../../../factories/StringHelpers'
  import TimeHelpers from '../../../factories/TimeHelpers'
  import SnackbarFactory from '../../../factories/SnackbarFactory'
  import { vendorClass } from '../../../factories/IconHelpers'

  export default {
    props: {
      id: { type: [ Number, String ] }
    },

    data() {
      return {
        isLoadingLocal: true,
        entityRecord: null,
        links: [],
        linksSortCol: 'name',
        linksSortDir: 'asc',
        error: null
      }
    },

    computed: {
      entityType() {
        return this.$store.state.session.current_team_types.find(t => t.id == this.entityRecord.entity_type_id)
      },

      sortedLinks() {
        const sortedLinks = this.links.sort((l1, l2) => {
          switch(this.linksSortCol) {
            case 'name':
              return (l1.name.toLowerCase() < l2.name.toLowerCase()) ? -1 : 1
            case 'source':
              return (l1.source.toLowerCase() < l2.source.toLowerCase()) ? -1 : 1
            case 'type':
              return (this.getEntityType(l1.entity_type_id).name.toLowerCase() < this.getEntityType(l2.entity_type_id).name.toLowerCase()) ? -1 : 1
          }
        })
        return (this.linksSortDir === 'desc') ? sortedLinks.reverse() : sortedLinks
      }
    },

    methods: {
      getFormattedDate: TimeHelpers.getFormattedDate,
      truncateString: StringHelpers.truncateString,
      titleCase: StringHelpers.titleCase,
      vendorClass,

      toggleSort(col) {
        if (this.linksSortCol !== col)
          this.linksSortDir = 'asc'
        else
          this.linksSortDir = (this.linksSortDir === 'asc') ? 'desc' : 'asc'

        this.linksSortCol = col
      },

      async createLink(record) {
        await ApiEntities.createLink(this.id, record.id)
        this.links = (await ApiEntities.getLinkedEntities(this.id)).records
      },

      shouldWrapInCard(string) {
        return string && string.length > 300
      },

      markdownToHtml(string) {
        return markdown.markdown.toHTML(string)
      },

      getEntityType(id) {
        return this.$store.state.session.current_team_types.find(t => t.id == id)
      },

      parseEntitySearchItem(item) {
        return `${item.name} (${this.getEntityType(item.entity_type_id).name})`
      }
    },

    async created() {
      try {
        const responses = await Promise.all([
          ApiEntities.get(this.id),
          ApiEntities.getLinkedEntities(this.id)
        ])
        this.entityRecord = responses[0].record
        this.links = responses[1].records
      } catch(err) {
        this.error = err.message
      } finally {
        this.isLoadingLocal = false
      }
    }
  }
</script>

<style scoped lang="scss">
  .border-subtle {
    border-bottom: 1px #f0f0f0 solid;
  }

  .entity-content {
    overflow: hidden;

    * {
      font-size: 1em;
    }

    img {
      max-width: 100%;
    }
  }
</style>
