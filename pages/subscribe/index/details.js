import MComponent from '../../../common/MComponent'
const app = require("../data.js")
var util = require("../index.js")
MComponent({
  data: {
    isIpx: app.globalData.isIpx,
    boxShoe: false,
    https: app.globalData.https,
    details: {},
    title: '',
    param: {
      "project": {
        "projId": "",
        "join": {
          "inner_join": {
            "join": "area.gid,project.areaId",
            "field": "areaName"
          }
        }
      }
    },
    unfold: {
      itme1: true,
      itme2: true
    },
    markersShow: false,
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
    }],
  },
  computed: {
    coordinate () {
      const { details } = this.data
      let obj = {}
      if (details) {
        const { latitude, longitude } = details
        obj = { latitude: Number(latitude), longitude: Number(longitude) }
      }
      return obj
    }
  },
  methods: {
    sub() {
      this.setData({
        boxShoe: true
      })
    },
    hideBox () {
      this.setData({
        boxShoe: false
      })
    },
    getUserInfo(e) {
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
                that.jump()
              } else {
                wx.showToast({ title: resc.msg, icon: 'none', duration: 2000 });
              }
            })
          } else {
            wx.hideLoading()
            wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
          }
        })
      } else {
        wx.showToast({ title: '授权后才能认购', icon: 'none', duration: 2000 });
      }
    },
    jump() {
      if (app.globalData.member) {
        //选房
        wx.navigateTo({
          url: '../subscribe/room?projid=' + this.data.param.project.projId + '&title=' + this.data.title,
        })
      } else {
        //登录
        wx.navigateTo({
          url: '../subscribe/index?projid=' + this.data.param.project.projId + '&title=' + this.data.title,
        })
      }
      this.setData({
        boxShoe: false
      })
    },
    onUnfold(e) {
      let unfold = this.data.unfold
      let attribute = e.currentTarget.dataset.index
      unfold[attribute] = !unfold[attribute]
      this.setData({
        unfold
      })
    },
    wayDetails() {
      wx.showLoading({ title: '加载中..', mask: true });
      let that = this
      let param = that.data.param
      app.fetch('/MiniProgram/Purchase/GetJson', {
        param: JSON.stringify(param)
      }, function (res) {
        console.log(res)
        wx.hideLoading()
        if (res.data.isSuccess) {
          res.data.project.projImg = JSON.parse(res.data.project.projImg)
          let markers = that.data.markers
          markers[0].latitude = res.data.project.latitude
          markers[0].longitude = res.data.project.longitude 
          that.setData({
            details: res.data.project,
            markersShow: markers[0].latitude ? true : false,
            markers
          })
        } else {
          wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
        }
      })
    },
    onLoad(options) {
      let that = this
      console.log(options)
      console.log(app.globalData)
      if (options.projid) {
        this.data.param.project.projId = options.projid
        this.wayDetails()
      } else {
        wx.reLaunch({
          url: '../index/index',
        })
      }
      if (options.title) {
        wx.setNavigationBarTitle({
          title: decodeURIComponent(options.title)
        })
        this.setData({
          title: options.title
        })
      }
      if (app.globalData.data.unionid) {
        wx.hideLoading()
        that.setData({
          unionid: app.globalData.data.unionid
        })
      } else {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              app.onlogin().then(function (res) {
                if (res.IsSuccess) {
                  app.globalData.data = res.Data
                  return app.getUserInfo()
                } else {
                  wx.hideLoading()
                  wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
                }
              }).then(function (res) {
                wx.hideLoading()
                if (res.IsSuccess) {
                  app.globalData.data.unionid = res.Data.Fans.unionID
                  that.setData({
                    unionid: app.globalData.data.unionid,
                    userInfo: app.globalData.userInfo
                  })
                  wx.setStorageSync('unionid', app.globalData.data.unionid)
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
      wx.getSystemInfo({
        success(res) {
          var name1 = 'iPhone X'
          var name2 = 'iPhone XR'
          var name3 = 'iPhone XS'
          var name4 = 'iPhone XS Max'
          // console.log(res.model);
          if (res.model.indexOf(name1) > -1) {
            app.globalData.isIpx = true
          }
          if (res.model.indexOf(name2) > -1) {
            app.globalData.isIpx = true
          }
          if (res.model.indexOf(name3) > -1) {
            app.globalData.isIpx = true
          }
          if (res.model.indexOf(name4) > -1) {
            app.globalData.isIpx = true
          }
          that.setData({
            isIpx: app.globalData.isIpx,
          })
        }
      })
    }
  }
}, true)