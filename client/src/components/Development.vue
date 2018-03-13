<template lang="pug">
  b-container(:fluid="true")
    div(v-if="isLoading")
      loader
    b-row(v-if="!isLoading")
      side-bar
      b-col.padding-medium
        b-progress(:value="counter" :max="max" show-progress animated)
        b-progress.mt-1(:max="max" show-value)
          b-progress-bar(:value="counter*(6/10)" variant="success")
          b-progress-bar(:value="counter*(2.5/10)" variant="warning")
          b-progress-bar(:value="counter*(1.5/10)" variant="danger")
        b-btn.mt-4(@click="clicked") Click Me
</template>

<script>
  import SideBar from './SideBar'

  export default {
    data () {
      return {
        counter: 45,
        max: 100
      }
    },

    components: {
      SideBar
    },

    methods: {
      clicked () {
        this.counter = Math.random() * this.max
        console.log('Change progress to ' +
          Math.round(this.counter * 100) / 100)
      }
    },

    created() {
      this.isLoading = false
    }
  }
</script>
