<template lang="pug">
  a.oauth-login-button.d-flex.flex-row.align-items-center.justify-content-center(:class="map.mainClass",:href="map.link")
    i(:class="map.deviconClass")
    div Login with {{ map.text }}
</template>

<script>
  export default {
    props: {
      type: { type: String },
      href: { type: String, default: null }
    },

    data() {
      return {
        map: {},

        typeMap: {
          github: {
            deviconClass: 'devicon-github-plain',
            link:         '/auth/github',
            mainClass:    'github',
            text:         'Github'
          },

          google: {
            deviconClass: 'devicon-google-plain',
            link:         '/auth/google',
            mainClass:    'google',
            text:         'Google'
          },

          salesforce: {
            deviconClass: [ 'fa', 'fa-cloud' ],
            link:         '/oauth/salesforce',
            mainClass:    'salesforce',
            text:         'Salesforce'
          }
        }
      }
    },

    created() {
      this.map = this.typeMap[this.type]
      if (this.href)
        this.map.link = this.href
    }
  }
</script>

<style lang="scss">
  .oauth-login-button {
    padding: 10px;
    margin: 10px 0px;
    border: 1px solid;
    border-radius: 3px;
    width: 100%;

    &:hover {
      text-decoration: none;
    }

    > i {
      margin-right: 5px;
    }

    &.github {
      background: #24292e;
      border-color: #ccc;
      color: #fff;
    }

    &.google {
      background: #d14836;
      border-color: #f00;
      color: #fff;
    }

    &.salesforce {
      background: #3290c5;
      border-color: #215ca0;
      color: #fff;
    }
  }
</style>
