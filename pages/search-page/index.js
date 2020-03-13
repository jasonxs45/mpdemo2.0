import MComponent from '../../common/MComponent'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      keyword: store => store.keyword
    }
  },
  data: {
    value: '',
    latest_keywords: []
  },
  methods: {
    confirm () {
      store.updateKeyword(this.data.value)
      wx.switchTab({
        url: '/pages/projects/list',
        fail: err => {
          wx.redirectTo({
            url: '/pages/projects/list'
          })
        }
      })
    },
    clear () {
      this.set({
        latest_keywords: []
      })
      wx.removeStorageSync('latest_keywords')
    },
    onInput (e) {
      const { value } = e.detail
      this.data.value = value
      store.updateKeyword(this.data.value)
    },
    onClear () {
      this.set({
        value: ''
      })
      store.updateKeyword(this.data.value)
    },
    onTap (e) {
      const { val } = e.currentTarget.dataset
      this.set({
        value: val
      })
      store.updateKeyword(this.data.value)
    },
    onShow() {
      this.data.value = store.keyword
      this.data.latest_keywords = wx.getStorageSync('latest_keywords') || []
      this.set({
        latest_keywords: this.data.latest_keywords,
        value: this.data.value
      })
    },
    onHide() { },
    onUnload() { }
  }
}, true)