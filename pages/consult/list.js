import Page from '../../common/Page'
import { _list, _dispatch } from '../../api/consult'
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
    consultInfo: null,
    list: []
  },
  getList() {
    const { pid } = this.data
    if (pid === '') return
    app.loading('加载中')
    _list({ ProjectID: pid })
      .then(res => {
        wx.hideLoading()
        console.log(res)
        const { code, msg, data } = res.data
        if (code === 0) {
          this.set({
            list: data
          })
        } else {
          wx.showModal({
            title: '温馨提示',
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
  },
  goChat(e) {
    const { index } = e.currentTarget.dataset
    const { list, member, pid } = this.data
    const consultInfo = list[index]
    if (consultInfo) {
      wx.showModal({
        title: '温馨提示',
        content: '每个楼盘仅可绑定一位置业顾问，请确认您的选择！',
        success: r => {
          if (r.confirm) {
            const UnionID = member.UnionID
            const ProjectID = pid
            const ConsultantID = consultInfo.ID
            app.loading('加载中')
            _dispatch({ UnionID, ProjectID, ConsultantID })
              .then(res => {
                wx.hideLoading()
                const { code, msg, data } = res.data
                if (code === 0) {
                  wx.redirectTo({
                    url: `/pages/consult/index?pid=${pid}&consultid=${ConsultantID}`
                  })
                } else {
                  wx.showModal({
                    title: '温馨提示',
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
          }
        }
      })
    }
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
  onLoad(options) {
    app.login()
    const { pid } = options
    this.set({
      pid
    })
    this.getList()
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