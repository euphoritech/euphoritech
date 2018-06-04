<template>
  <b-modal id="create-entity-modal" ref="createEntityModal" v-model="$store.state.showEntityModal" size="lg" centered title="Create Record">
    <b-row>
      <b-col class="d-none d-md-block" cols="12">
        <b-form @submit="createRecord" onkeypress="return event.keyCode !== 13">
          <b-form-group label="Record Type">
            <b-form-select v-model="$store.state.entityModalTypeId" size="lg" :options="entityTypes" placeholder="Select a record type to create." />
          </b-form-group>
          <hr class="separate-vert-large" />
          <b-card>
            <b-tabs :card="true">
              <b-tab title="Manual">
                <b-form-group label="Name">
                  <b-form-input v-model="entityData.name" />
                </b-form-group>
                <b-form-group label="Due/Delivery Date">
                  <datepicker v-model="entityData.dueDate"></datepicker>
                </b-form-group>
                <b-form-group id="entity-uid" label="Unique ID (optional)">
                  <b-form-input v-model="entityData.uid" />
                </b-form-group>
                <b-tooltip target="entity-uid" title="If you'd like to assign this a unique identifier of some sort, enter that here."></b-tooltip>
                <b-form-group label="Description">
                  <b-form-textarea v-model="entityData.description" rows="3"></b-form-textarea>
                </b-form-group>
              </b-tab>
              <b-tab v-if="hasGithub" title="GitHub">
                <component v-show="entityData.source !== 'github'" is="Github" @setEntityData="setEntityData"></component>
                <div v-show="entityData.source === 'github'">
                  <div class="text-right">
                    <a href="javascript:void(0)" @click="resetData()">Reset</a>
                  </div>
                  <b-row class="margin-bottom-medium" v-for="(label, key) in $store.state.dataLabelMaps.github" :key="key">
                    <b-col cols="3">
                      <strong>{{ label }}</strong>
                    </b-col>
                    <b-col cols="9">{{ entityData[key] || 'Nothing here...' }}</b-col>
                  </b-row>
                </div>
              </b-tab>
              <b-tab v-if="hasSfdc" title="Salesforce">
                <component v-show="entityData.source !== 'salesforce'" is="Salesforce" @setEntityData="setEntityData"></component>
                <div v-show="entityData.source === 'salesforce'">
                  <div class="text-right">
                    <a href="javascript:void(0)" @click="resetData()">Reset</a>
                  </div>
                  <b-row class="margin-bottom-medium" v-for="(label, key) in $store.state.dataLabelMaps.salesforce" :key="key">
                    <b-col cols="3">
                      <strong>{{ label }}</strong>
                    </b-col>
                    <b-col cols="9">{{ entityData[key] || 'Nothing here...' }}</b-col>
                  </b-row>
                </div>
              </b-tab>
            </b-tabs>
          </b-card>
          <div class="margin-top-medium text-center">
            <b-button type="submit" size="lg" variant="primary" :disabled="!validEntityInfo">Create Record</b-button>
          </div>
        </b-form>
      </b-col>
    </b-row>
    <div slot="modal-footer"></div>
  </b-modal>
</template>

<script>
  import Github from './Github'
  import Salesforce from './Salesforce'
  import ApiEntities from '../../../factories/ApiEntities'
  import SnackbarFactory from '../../../factories/SnackbarFactory'
  import EuphoritechSocket from '../../../factories/EuphoritechSocket'

  export default {
    props: {
      loggedIn: { type: Boolean, default: false }
    },

    data() {
      return {
        entityTypes: [],
        hasGithub: false,
        hasSfdc: false,
        initData: null,
        entityData: {
          source: 'manual',
          entityTypeId: null,
          dueDate: null,
          name: null,
          description: null,
          uid: null,
          mod1: null,
          mod2: null,
          mod3: null,
          mod4: null,
          mod5: null
        }
      }
    },

    computed: {
      validEntityInfo() {
        return this.entityData.source && this.entityData.entityTypeId && this.entityData.name
      }
    },

    methods: {
      async createRecord(e) {
        e.preventDefault()

        this.entityData.entityTypeId = this.$store.state.entityModalTypeId
        await ApiEntities.createEntity(this.entityData)

        this.$store.commit('TOGGLE_CREATE_ENTITY_MODAL')
        this.resetData()
        SnackbarFactory(this).open(`Successfully created a new ${this.getSelectedType()}!`)
      },

      setEntityData(info) {
        this.entityData = Object.assign(this.entityData, info)
      },

      getSelectedType() {
        return this.entityTypes.find(f => f.value === this.entityData.entityTypeId).text
      },

      resetData() {
        this.entityData = Object.assign({}, this.initData)
      },
    },

    watch: {
      async loggedIn(newVal, oldVal) {
        if (!!newVal) {
          this.entityTypes = (await ApiEntities.getTypes()).types.filter(t => !!t.is_active)
            .map(t => ({ value: t.id, text: t.name }))
            .sort((t1, t2) => (t1.text.toLowerCase() < t2.text.toLowerCase()) ? -1 : 1)

          this.$store.state.entityModalTypeId = this.entityData.entityTypeId = this.entityTypes[0].value
          this.initData = this.initData || Object.assign({}, this.entityData, { entityTypeId: this.entityData.entityTypeId })

          this.hasGithub = !!this.$store.state.auth.team_integrations.github
          this.hasSfdc = !!this.$store.state.auth.team_integrations.salesforce
        }
      }
    },

    components: {
      Github,
      Salesforce
    },
  }
</script>
