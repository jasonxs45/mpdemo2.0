import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    projid: null,
    genre: true,
    unionid: null,
    sms: {
      status: true,
      number: '',
      income: '',
      text: '获取验证码'
    },
    form: {
      fansID: '',
      name: '',
      tel: '',
    }
  },
  onBindinput: function (e) {
    let form = this.data.form
    let attribute = e.currentTarget.dataset.name
    form[attribute] = e.detail.value
    this.setData({
      form
    })
  },
  onSms() {
    let that = this
    let sms = this.data.sms
    if (sms.status) {
      if (!util.checkPhone(that.data.form.tel)) {
        wx.showToast({ title: '请填写正确的手机号码', icon: 'none', duration: 2000 });
        return
      }
      wx.showLoading({ title: '发送中...', mask: true });
      app.fetch('/MiniProgram/Purchase/SendSmsCode', {
        phone: that.data.form.tel,
      }, function (res) {
        wx.hideLoading()
        if (res.data.IsSuccess) {
          sms.income = res.data.Data
          // 验证码显示到页面上
          sms.number = res.data.Data
          sms.status = false
          let time = 60
          let timing = setInterval(function () {
            sms.text = '倒计时' + time + 's'
            time--
            if (time < 0) {
              sms.status = true
              sms.text = '获取验证码'
              clearInterval(timing);
            }
            that.setData({
              sms
            })
          }, 1000);
        } else {
          wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
        }
      })
    }
  },
  onSmsInput(e) {
    let sms = this.data.sms
    sms.number = e.detail.value
    this.setData({
      sms
    })
  },
  // 注册
  registered() {
    let that = this
    let form = that.data.form
    form.fansID = that.data.unionid
    if (!util.checkName2(form.name ? form.name : '')) {
      wx.showToast({ title: '请输入姓名', icon: 'none', duration: 2000 });
      return
    }
    if (!util.checkPhone(form.tel)) {
      wx.showToast({ title: '请填写正确的手机号码', icon: 'none', duration: 2000 });
      return
    }
    // if (that.data.sms.income.length < 4) {
    //   wx.showToast({ title: '请获取验证码', icon: 'none', duration: 2000 });
    //   return
    // }
    // if (that.data.sms.number.length < 4 || that.data.sms.number != that.data.sms.income) {
    //   wx.showToast({ title: '请填写正确验证码', icon: 'none', duration: 2000 });
    //   return
    // }
    wx.showLoading({ title: '提交中...', mask: true });
    app.fetch('/MiniProgram/Purchase/Register', form, function (res) {
      console.log(res)
      wx.hideLoading()
      if (res.data.IsSuccess) {
        app.globalData.member = res.data.Data.memberId
        app.globalData.memberData = res.data.Data
        wx.setStorageSync('member', app.globalData.member)
        wx.showModal({
          title: '提示',
          content: '注册成功',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
            if (that.data.projid) {
              wx.redirectTo({
                url: 'room?projid=' + that.data.projid + '&title=' + that.data.title,
              })
            } else {
              wx.reLaunch({
                url: '/pages/usercenter/index',
              })
            }
          }
        })
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  // 授权手机号
  getPhoneNumber: function (e) {
    var that = this;
    console.log(e);
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      app.onlogin().then(function (res) {
        if (res.IsSuccess) {
          console.log(res)
          app.globalData.data = res.Data
          app.fetch('/MiniProgram/Purchase/GetUserPhone', {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            sessionId: app.globalData.data.sessionId
          }, function (res) {
            wx.hideLoading()
            if (res.data.IsSuccess){
              that.data.form.tel = res.data.Data.purePhoneNumber
              that.setData({
                form: that.data.form
              })
            }else{
              wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
            }
          })
        }
      })
    }
  },
  // 授权
  getUserInfo: function (e) {
    let that = this
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      app.onlogin().then(function (res) {
        if (res.IsSuccess) {
          console.log(res)
          app.globalData.data = res.Data
          app.fetch('/MiniProgram/Purchase/GetUserInfo', {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            key: app.globalData.data.sessionId
          }, function (resc) {
            wx.hideLoading()
            if (resc.data.IsSuccess) {
              app.globalData.data.unionid = resc.data.Data.Fans.unionID
              that.setData({
                unionid: app.globalData.data.unionid,
                userInfo: app.globalData.userInfo
              })
              if (resc.data.Data.Member) {
                app.globalData.member = resc.data.Data.Member.member
                app.globalData.memberData = resc.data.Data.Member
                wx.setStorageSync('member', app.globalData.member)
              }
              wx.setStorageSync('unionid', app.globalData.data.unionid)
              that.registered()
            } else {
              wx.showToast({ title: resc.msg, icon: 'none', duration: 2000 });
            }
          })
        } else {
          wx.hideLoading()
          wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
        }
      })
    }
  },
  onLoad: function (options) {
    console.log(options.projid)
    wx.showLoading({ title: '加载中..', mask: true });
    let that = this
    // return
    that.data.projid = options.projid ? options.projid : null
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          app.onlogin().then(function (res) {
            console.log(res)
            if (res.IsSuccess) {
              app.globalData.data = res.Data
              return app.getUserInfo()
            } else {
              wx.hideLoading()
              wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
              return
            }
          }).then(function (res) {
            console.log(res)
            wx.hideLoading()
            if (res.IsSuccess) {
              app.globalData.data.unionid = res.Data.Fans.unionID
              that.setData({
                unionid: app.globalData.data.unionid,
                userInfo: app.globalData.userInfo
              })
              wx.setStorageSync('unionid', app.globalData.data.unionid)
              if (res.Data.Member && res.Data.Member.memberId) {
                app.globalData.member = res.Data.Member.memberId
                app.globalData.memberData = res.Data.Member
                if (that.data.projid) {
                  wx.redirectTo({
                    url: 'room?projid=' + that.data.projid + '&title=' + that.data.title,
                  })
                } else {
                  // console.log('这里的跳转被我注释了')
                  wx.reLaunch({
                    url: '/pages/usercenter/index',
                  })
                }
              }
            } else {
              wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
            }
          })
        } else {
          console.log('没授权')
          wx.hideLoading()
        }
      }
    })
  }
})