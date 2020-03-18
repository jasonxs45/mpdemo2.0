import MComponent from '../../common/MComponent'
import { _detail, _exchange as _submit, _mydetail } from '../../api/goods'
import { _getPhoneNumber } from '../../api/getuserinfo'
const app = getApp()
MComponent({
  data: {
    id: '',
    member: null,
    tel: '',
    detail: null,
    words: '',
    myInfo: null
  },
  timer: null,
  methods: {
    getDetail() {
      const { id } = this.data
      _detail(id)
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              detail: data,
              words: data.GoodsInstructio
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
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    doTimer() {
      this.timer = setInterval(() => {
        const { myInfo } = this.data
        if (myInfo && myInfo.State === '已签到') {
          this.timer && clearInterval(this.timer)
        }
        this.getMyDetail()
      }, 4000)
    },
    getMyDetail() {
      const UnionID = wx.getStorageSync('uid')
      const { id: ID } = this.data
      _mydetail({ ID, UnionID })
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            if (data && data.UserGoodsTradeLog) {
              this.set({
                myInfo: data.UserGoodsTradeLog
              })
                .then(() => {
                  const { myInfo } = this.data
                  if (myInfo && (myInfo.State === '已核销' || myInfo.State === '已过期')) {
                    this.timer && clearInterval(this.timer)
                  }
                })
            }
          }
        })
        .catch(err => {
          console.log(err)
          // app.toast('获取信息失败')
          this.timer && clearInterval(this.timer)
        })
    },
    getPhoneNumber(e) {
      const { iv, encryptedData } = e.detail
      const OpenID = wx.getStorageSync('openid')
      if (iv && encryptedData) {
        app.loading('加载中')
        _getPhoneNumber({
          OpenID, iv, encryptedData
        })
          .then(res => {
            wx.hideLoading()
            const { code, msg, data } = res.data
            if (code === 0) {
              this.set({
                tel: data.purePhoneNumber
              })
              this.submit()
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
    submit() {
      const UnionID = wx.getStorageSync('uid')
      const { tel: Tel, id: ID } = this.data
      app.loading('提交中')
      _submit({ ID, UnionID, Tel })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            wx.showModal({
              title: '温馨提示',
              content: msg,
              cancelText: '返回列表',
              confirmText: '查看',
              success: r => {
                if (r.confirm) {
                  this.getMyDetail()
                  wx.pageScrollTo({
                    scrollTop: 0
                  })
                }
                if (r.cancel) {
                  wx.redirectTo({
                    url: '/pages/shop/list'
                  })
                }
              }
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
          console.log(err)
          wx.hideLoading()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onLoad(opt) {
      app.login()
      this.data.id = opt.id
      this.getDetail()
    },
    onShow() {
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          wx.hideLoading()
          this.set({
            member: memberInfo
          }).then(() => {
            this.getMyDetail()
            this.doTimer()
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
    },
    onUnload() {
      this.timer && clearInterval(this.timer)
    }
  }
}, true)