import Page from '../../common/Page'
import { _identity } from '../../api/usercenter'
import { rootUrl } from '../../api/urls.js'
const app = getApp()
const cardImgs = [
  `${rootUrl}/res/upload/AdminUpload/card/gold.png`,
  `${rootUrl}/res/upload/AdminUpload/card/silver.png`,
  `${rootUrl}/res/upload/AdminUpload/card/black.png`
]
Page({
  data: {
    cardImgs,
    detail: null
  },
  getDetail () {
    const UnionID = wx.getStorageSync('uid')
    _identity(UnionID)
      .then(res => {
        wx.hideLoading()
        const { code, msg, data } = res.data
        if (code === 0) {
          let str = data.Fans ? data.Fans.BindIDCard : ''
          data.Fans.idcard = str ? str.substr(0, 3) + str.slice(3, -4).replace(/\d/g, '*') + str.slice(-4) : str
          this.set({
            detail: data
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
        wx.showModal({
          title: '对不起',
          content: JSON.stringify(err),
          showCancel: false
        })
      })
  },
  onLoad(options) {
    app.loading('加载中')
    app.checkAuth()
      .then(res => {
        const uid = res
        this.set({
          uid
        })
        return app.getUserInfoByUid(uid)
      })
      .then(memberInfo => {
        this.set({
          member: memberInfo
        })
        this.getDetail()
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
              wx.switchTab({
                url: '/pages/usercenter/index'
              })
            }
          }
        })
      })
  },
  onReady() {},
  onShow () {}
})