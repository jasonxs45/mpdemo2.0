import MComponent from '../../common/MComponent'
import _login from '../../api/login'
import { _getPhoneNumber } from '../../api/getuserinfo'
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
    member:wx.getStorageSync('member'),
    show: false,
    agree: false,
    show2:false
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
    close2() {
      this.set({
        show2: false
      })
    },
    open() {
      if(app.uid) return
      app.loading('加载中...')
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
                  app.uid = UnionId
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
      app.loading('授权中...')
      app.onGetWXUserInfo(e)
        .then(res => {
          wx.hideLoading()
          console.log(res.member)
          this.updateMember(res.member)
          this.close()
          this.triggerEvent('success', { value: res.member})
          this.set({
            member: res.member
          })
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
            wx.showModal({
              title: '对不起',
              content: JSON.stringify(err),
              showCancel: false
            })
        })
    },
    getPhoneNumber(e) {
      const { iv, encryptedData } = e.detail
      const OpenID = wx.getStorageSync('openid')
      const UnionID = wx.getStorageSync('uid')
      if (iv && encryptedData) {
        app.loading('获取中...')
        _getPhoneNumber({
          OpenID, UnionID, iv, encryptedData
        })
          .then(res => {
            wx.hideLoading()
            const { code, msg, data } = res.data
            if (code === 0) {
              store.member.FansTel = data.purePhoneNumber
              this.updateMember(store.member)
              wx.setStorageSync('member', store.member)
              this.set({
                member: store.member
              })
            } else {
              wx.showModal({
                title: '对不起',
                content: msg,
                showCancel: false
              })
            }
          })
          .catch(err => {
            wx.hideLoading()
            console.log(err)
            wx.showModal({
              title: '对不起',
              content: JSON.stringify(err),
              showCancel: false
            })
          })
      }
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
    },
    // 获取全局配置
    _getSysConf(){
      app.getSysConf()
        .then(res => {
          console.log(res)
          store.updateSysConf(res)
          if(res.isLogin!='false'){
            this.setData({
              show2:true
            })
          }
        })
        .catch(err => {
          console.log(JSON.stringify(err))
        })
    }
  },
  lifetimes: {
    attached() {
      if(this.data.member&&this.data.member.FansTel){
        this.setData({
          show2:true
        })
      }else{
        this._getSysConf()
      }
      console.log('授权组件2',this.data.member,this.data.show2)
      this.open()
    },
    ready() {}
  }
})
