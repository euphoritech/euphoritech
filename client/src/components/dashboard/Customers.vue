<template lang="pug">
  b-col
    b-table(striped hover :items="customers")
</template>

<script>
  export default {
    data() {
      return {
        customers: []
      }
    },

    methods: {

    },

    created() {
      this.customers = [
        { current: true, age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
        { current: false, age: 21, first_name: 'Larsen', last_name: 'Shaw' },
        { current: false, age: 89, first_name: 'Geneva', last_name: 'Wilson' },
        { current: true, age: 38, first_name: 'Jami', last_name: 'Carney' }
      ]
    }
  }
</script>
