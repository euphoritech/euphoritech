<template lang="pug">
  div#chat-widget-wrapper(v-if="loggedIn && $store.state.chatWidget.isOpen")
    div CHAT
</template>

<script>
  export default {
    props: {
      loggedIn: { type: Boolean, default: false }
    },

    data() {
      return {
        widgetId: 'chat-widget-wrapper'
      }
    },

    methods: {
      dragAndDropWidget() {
        const widgetElement = document.getElementById(this.widgetId)
        if (widgetElement) {
          widgetElement.addEventListener('dragstart', this.dragStart.bind(this), false)
          document.body.addEventListener('dragover', this.dragOver.bind(this), false)
          document.body.addEventListener('drop', this.drop.bind(this), false)
          return true
        }
      },

      dragStart(event) {
        console.log("DRAGSTART")
        const style = window.getComputedStyle(event.target, null)
        event.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY))
      },

      dragOver(event) {
        event.preventDefault()
        return false
      },

      drop(event) {
        const offset = event.dataTransfer.getData("text/plain").split(',')
        const widgetElement = document.getElementById(this.widgetId)
        widgetElement.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px'
        widgetElement.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px'
        event.preventDefault()
        return false
      }
    },

    watch: {
      async loggedIn(newVal, oldVal) {
        if (!!newVal) {
          const dragInt = setInterval(() => {
            if (this.dragAndDropWidget())
              return clearInterval(dragInt)
          }, 250)
        }
      }
    }
  }
</script>

<style scoped>
  #chat-widget-wrapper {
    position: absolute;
    background: blue;
    color: white;
    width: 100px;
    height: 100px;
    bottom: 0px;
    right: 20px;
    z-index: 2;
  }
</style>
