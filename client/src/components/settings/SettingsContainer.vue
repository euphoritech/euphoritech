<template>
  <b-modal id="settings-modal" ref="settingsModal" v-model="$store.state.settings.isOpen" size="lg" centered title="Settings">
    <b-row class="settings-modal-content-wrapper">
      <b-col class="settings-nav" cols="2">
        <b-navbar v-b-scrollspy:settings-content>
          <b-nav pills class="flex-column">
            <b-nav-item v-for="setting in settings" @click="goToSection(setting)" :href="'#' + getSettingId(setting)" :key="getSettingId(setting)">
              {{ setting.header }}
            </b-nav-item>
          </b-nav>
        </b-navbar>
      </b-col>
      <b-col id="settings-content">
        <div :id="getSettingId(setting)" v-for="setting in settings">
          <h2>{{ setting.header }}</h2>
          <div v-if="setting.content">{{ setting.content }}</div>
          <component v-if="setting.component" class="padding-small" :is="setting.component"></component>
          <hr>
        </div>
      </b-col>
    </b-row>
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
  import Personal from './Personal'
  import SettingsFactory from '../../factories/ApiSettings'

  export default {
    data() {
      return {
        settings: []
      }
    },

    methods: {
      getSettingId(setting) {
        return setting.id || setting.header
      },

      async goToSection(setting) {
        const id = this.getSettingId(setting)
        await SettingsFactory.open(id)
      }
    },

    components: {
      Personal
    },

    created() {
      this.settings = [
        { header: 'Personal Info', id: "personal", component: Personal },
        { header: 'Customers', id: "customers", content: 'My infor' },
        { header: 'Development', id: "development", content: 'My infor' },
        { header: 'Support', id: "support", content: 'My infor' },
        { header: 'Marketing', id: "marketing", content: 'My infor' },
        { header: 'Teams', id: 'teams', content: 'My infor' }
      ]
    },

    mounted() {
      this.$refs.settingsModal.$on('hide', async () => {
        this.$router.push(location.pathname)
        await SettingsFactory.close()
      })

      // If we are opening the settings modal back to a particular
      // partial go ahead and update the hash to the appropriate
      // section now
      setTimeout(() => {
        if (this.$store.state.settings && this.$store.state.settings.section)
          location.hash = this.$store.state.settings.section
      }, 250)
    }
  }
</script>

<style scoped>
  .settings-nav {
    overflow: hidden;
    font-size: 11px;
  }

  .settings-nav .nav-item {
    width: 165px;
  }

  .settings-modal-content-wrapper {
    max-height: 450px;
  }

  #settings-content {
    position: relative;
    overflow-y: auto;
  }
</style>
