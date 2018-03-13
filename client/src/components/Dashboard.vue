<template lang="pug">
  b-container(:fluid="true")
    div(v-if="isLoading")
      loader
    b-row(v-if="!isLoading")
      side-bar
      b-col
        b-row.padding-medium.center-everything
          b-col
            b-card.b-card.mb-2.margin-medium(title="Card Title" img-src="https://api.restcharts.com/chart/area?data=1,2,6,4,10,7,4,5,2,9,8&color=f00&opacity=0.2" img-alt="Image" img-top tag="article")
              p.card-text Some quick example text to build on the card title and make up the bulk of the card's content. This could be analytics data.
              b-button.primary(href="/") Go somewhere
          b-col
            b-card.b-card.mb-2.margin-medium(title="Card Title" img-src="https://api.restcharts.com/chart/bar?data=1,2,3,4,3,2,1&color=0000ff" img-alt="Image" img-top tag="article")
              p.card-text Some quick example text to build on the card title and make up the bulk of the card's content. This could be analytics data.
              b-button.primary(href="/") Go somewhere
          b-col
            b-card.b-card.mb-2.margin-medium(title="Card Title" img-src="https://api.restcharts.com/chart/line?data=5,1,2,9,8,3,0,0,4&color=00ff00" img-alt="Image" img-top tag="article")
              p.card-text Some quick example text to build on the card title and make up the bulk of the card's content. This could be analytics data.
              b-button.primary(href="/") Go somewhere
          b-col
            b-card.b-card.mb-2.margin-medium(title="Card Title" img-src="https://api.restcharts.com/chart/column?data=1,2,3,4,3,2,1&color=0000ff" img-alt="Image" img-top tag="article")
              p.card-text Some quick example text to build on the card title and make up the bulk of the card's content. This could be analytics data.
              b-button.primary(href="/") Go somewhere
          b-col
            b-card.b-card.mb-2.margin-medium(title="Card Title" img-src="https://api.restcharts.com/chart/spline?data=1,2,6,4,10,7,4,5,2,9,8&color=f00" img-alt="Image" img-top tag="article")
              p.card-text Some quick example text to build on the card title and make up the bulk of the card's content. This could be analytics data.
              b-button.primary(href="/") Go somewhere
</template>

<script>
  import SideBar from './SideBar'

  export default {
    data() {
      return {
        isLoading: true,
      }
    },

    components: {
      SideBar
    },

    methods: {

    },

    created() {
      this.isLoading = false
    }
  }
</script>
