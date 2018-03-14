<template lang="pug">
  b-col.side-nav(cols="3",md="2")
    b-list-group
      b-list-group-item(href="/") Home
      b-list-group-item(href="/dashboard/customers") Customers
      b-list-group-item(href="/dashboard/development") Development
      b-list-group-item(href="/dashboard/support") Support
</template>

<script>
  export default {
    methods: {

    }
  }
</script>
