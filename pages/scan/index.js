import Page from '../../common/Page'
import { _analysiscode } from '../../api/scan'
const app = getApp()
Page({
  data: {
    role: null,
    disabled: false
  },
  openScan() {
    wx.scanCode({
      onlyFromCamera: true,
      success: res => {
        wx.showModal({
          title: '温馨提示',
          content: '是否核销/签到？',
          success: r => {
            if (r.confirm) {
              let str = decodeURIComponent(res.result)
              let arr = str.split('&')
              let opt = {}
              let len = arr.length
              if (len) {
                for (let i = 0; i < len; i++) {
                  let item = arr[i].split('=')
                  opt[item[0]] = item[1]
                }
                const { Type, ObjectID } = opt
                console.log(Type, ObjectID)
                const { uid: UnionID } = this.data
                app.loading('处理中')
                this.set({
                  disabled: true
                })
                _analysiscode({ Type, ObjectID, UnionID })
                  .then(res => {
                    wx.hideLoading()
                    this.set({
                      disabled: false
                    })
                    const { code, msg, data } = res.data
                    wx.showModal({
                      title: code === 0 ? '温馨提示' : '对不起',
                      content: msg,
                      showCancel: false
                    })
                  }).catch(err => {
                    console.log(err)
                    wx.hideLoading()
                    this.set({
                      disabled: false
                    })
                    wx.showModal({
                      title: '对不起',
                      content: '请求失败，请稍后再试',
                      showCancel: false
                    })
                  })
              }
            }
          }
        })
      }
    })
  },
  onLoad(options) {
    this.data.role = options.role
  },
  onReady() {
    // 自动打开
    // this.openScan()
  },
  onShow() {
    app.loading('加载中')
    app.checkAuth()
      .then(res => {
        wx.hideLoading()
        const uid = res
        this.set({
          uid
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
        wx.showModal({
          title: '温馨提示',
          content: '使用本功能前，请先登录',
          showCancel: false,
          success: r => {
            if (r.confirm) {
              wx.redirectTo({
                url: '/pages/usercenter/index'
              })
            }
          }
        })
      })
  }
})