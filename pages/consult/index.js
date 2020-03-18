import Page from '../../common/Page'
import { _dispatch, _scan } from '../../api/consult'
import { _getPhoneNumber } from '../../api/getuserinfo'
import { USER_DIALOG, USER_DATE } from '../../config/tmplIds'
const tmplIds = [USER_DIALOG, USER_DATE]
const app = getApp()
Page({
  data: {
    uid: '',
    tel: '',
    pid: '',
    consultantID: '',
    consultInfo: null
  },
  goChat() {
    const { consultInfo, member } = this.data
    app.getReddit(tmplIds, () => {
      wx.redirectTo({
        url: `/pages/chat/dialog?consultantID=${consultInfo.ID}&userUnionID=${member.UnionID}&fromUnionID=${member.UnionID}&toUnionID=${consultInfo.UnionID}`
      })
    })
  },
  getConsult() {
    const { pid, consultantID } = this.data
    console.log(pid, consultantID)
    const UnionID = wx.getStorageSync('uid')
    let func = () => new Promise()
    // 项目详情入口
    if (pid) {
      func = () => _dispatch({ UnionID, ProjectID: pid })
    }
    // 扫码入口
    if (consultantID) {
      func = () => _scan({ UnionID, ConsultantID: consultantID })
    }
    app.loading('加载中')
    func()
      .then(res => {
        wx.hideLoading()
        const { code, msg, data } = res.data
        console.log(res)
        if (code === 0) {
          this.set({
            consultInfo: data.ConsultantInfo
          })
        } else {
          wx.showModal({
            title: '对不起',
            content: msg,
            showCancel: false,
            success: r => {
              if (r.confirm) {
                if (pid) {
                  wx.navigateBack()
                }
                if (consultantID) {
                  wx.switchTab({
                    url: '/pages/usercenter/index'
                  })
                }
              }
            }
          })
        }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
        wx.showModal({
          title: '对不起',
          content: JSON.stringify(err),
          showCancel: false,
          success: r => {
            if (r.confirm) {
              if (pid) {
                wx.navigateBack()
              }
              if (consultantID) {
                wx.switchTab({
                  url: '/pages/usercenter/index'
                })
              }
            }
          }
        })
      })
  },
  getPhoneNumber(e) {
    const { iv, encryptedData } = e.detail
    const OpenID = wx.getStorageSync('openid')
    const UnionID = wx.getStorageSync('uid')
    if (iv && encryptedData) {
      app.loading('加载中')
      _getPhoneNumber({
        OpenID, UnionID, iv, encryptedData
      })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              tel: data.purePhoneNumber
            })
              .then(() => {
                const { consultInfo } = this.data
                const uid = wx.getStorageSync('uid')
                wx.redirectTo({
                  url: `/pages/chat/dialog?consultantID=${consultInfo.ID}&userUnionID=${uid}&fromUnionID=${uid}&toUnionID=${consultInfo.UnionID}`
                })
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
  onLoad (options) {
    app.login()
    const fromScan = options.scene
    this.data.fromScan = fromScan
    if (!fromScan) {
      const { pid, consultid } = options
      if (consultid) {
        console.log('用户自己转发')
      }
      this.set({
        pid: pid || '',
        consultantID: consultid || ''
      })
    } else {
      console.log('扫码进入')
      const query = decodeURIComponent(options.scene)
      let arr = query.split('&')
      arr = arr.map(item => item.split('='))
      let obj = {}
      for (let i = 0, len = arr.length; i < len; i++) {
        obj[arr[i][0]] = obj[arr[i][0]] || arr[i][1]
      }
      const { ConsultantID: consultantID } = obj
      console.log(consultantID)
      this.set({
        consultantID
      })
    }
  },
  onShow() {
    app.loading('加载中')
    app.checkAuth()
      .then(res => {
        const uid = res
        this.set({
          uid
        })
        return app.getUserInfoByUid(uid, true)
      })
      .then(memberInfo => {
        wx.hideLoading()
        this.set({
          member: memberInfo
        })
        if (memberInfo.FansTel) {
          this.set({
            tel: memberInfo.FansTel
          })
        }
        this.getConsult()
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
  },
  onShareAppMessage () {
    return {
      title: app.shareInfo.title,
      path: `/pages/consult/index?consultid=${this.data.consultantID}`
    }
  }
})