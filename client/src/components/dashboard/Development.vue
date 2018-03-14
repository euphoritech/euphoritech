<template lang="pug">
  b-col
    b-progress(:value="counter" :max="max" show-progress animated)
    b-progress.mt-1(:max="max" show-value)
      b-progress-bar(:value="counter*(6/10)" variant="success")
      b-progress-bar(:value="counter*(2.5/10)" variant="warning")
      b-progress-bar(:value="counter*(1.5/10)" variant="danger")
    b-btn.mt-4(@click="clicked") Click Me
</template>

<script>
  export default {
    data () {
      return {
        counter: 45,
        max: 100
      }
    },

    methods: {
      clicked () {
        this.counter = Math.random() * this.max
        console.log('Change progress to ' +
          Math.round(this.counter * 100) / 100)
      }
    }
  }
</script>
