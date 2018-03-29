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
