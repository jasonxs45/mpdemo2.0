import MComponent from '../../common/MComponent'
import _login from '../../api/login'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      member: store => store.member
    },
    actions: ['updateMember']
  },
  properties: {
    openType: {
      type: String
    },
    addOption: {
      type: Object,
      value: null
    }
  },
  data: {
    show: false,
    agree: false
  },
  methods: {
    toggle() {
      this.set({
        agree: !this.data.agree
      })
    },
    close() {
      this.set({
        show: false
      })
    },
    open() {
      app.loading()
      wx.login({
        success: r => {
          wx.hideLoading()
          if (r.code) {
            _login(r.code)
              .then(res => {
                const { code, msg, data } = res.data
                if (code === 0) {
                  console.log(data)
                  let { OpenId, SessionKey, UnionId } = data
                  UnionId = UnionId || wx.getStorageSync('uid')
                  wx.setStorageSync('openid', OpenId)
                  wx.setStorageSync('uid', UnionId)
                  wx.setStorageSync('s_key', SessionKey)
                } else {
                  app.toast(msg)
                }
              })
              .catch(err => {
                app.toast(JSON.stringify(err))
              })
          }
        },
        fail: e => {
          console.log(e)
          wx.hideLoading()
        }
      })
      this.set({
        show: true
      })
    },
    showTip() {
      app.toast('请先勾选同意用户协议')
    },
    addShare () {
      // const { addOption } = this.data
      // if (!addOption) {
      //   return
      // }
      // const { objectId: ObjectID, type: Type } = addOption
      // const UnionID = wx.getStorageSync('uid')
      // const ShareUnionID = wx.getStorageSync('shareuid')
      // console.log(ShareUnionID, UnionID, ObjectID, Type)
      // if (!ObjectID || !Type || !UnionID || !ShareUnionID) {
      //   return
      // }
      // console.log('授权后增加分享')
      // _addshare({ ShareUnionID, UnionID, ObjectID, Type })
      //   .then(res => {
      //     console.log(res)
      //   })
      //   .catch(err => {
      //     console.log(err)
      //     wx.showModal({
      //       title: '对不起',
      //       content: JSON.stringify(err),
      //       showCancel: false
      //     })
      //   })
    },
    onGetWXUserInfo(e) {
      app.onGetWXUserInfo(e)
        .then(res => {
          console.log(res.member)
          this.updateMember(res.member)
          // this.addShare()
          this.close()
          this.triggerEvent('success', { value: res.member})
        })
    },
    showAuth() {
      this.set({
        authShow: true
      })
    },
    hideAuth() {
      this.set({
        authShow: false
      })
    }
  },
  lifetimes: {
    attached() {},
    ready() {}
  }
})
