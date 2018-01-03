import Vue from 'vue'
import HomeContainer from '@/components/HomeContainer'

describe('HomeContainer.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(HomeContainer)
    const vm = new Constructor().$mount()
    // expect(vm.$el.querySelector('.main h3').textContent)
    //   .to.equal('Welcome to Your Vue.js App')
  })
})
