import MComponent from '../../common/MComponent'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      keyword: store => store.keyword,
      city: store => store.city
    }
  },
  data: {
    loading: false,
    list: []
  },
  methods: {
    onInit (e) {
      console.log('top init')
      this.triggerEvent('inited', e.detail)
    },
    onFocus () {
      wx.navigateTo({
        url: '/pages/search-page/index'
      })
    },
    onClear() {
      store.updateKeyword('')
    }
  }
})