import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    status:false,
    https: app.globalData.https,
    list:[],
    latest: true,
    param: {
      "project_list": {
        "areaId": "", //条件 区域ID
        "isValid": true,
        "order": "recommend-,sort+",
        "state": "正常",
        "page": 1,//参数当前页
        "count": 10,//参数每页条数
        "field": "projId,projName,recommend,address,tel,price,state,thumbnail,sort",
        "join": {
          "inner_join": {
            "join": "area.gid,project.areaId",
            "field": "areaName"
          }
        }
      },
      "total_count": ""
    },
    place: [],
    placelist: [],
    index: 0,
  },
  wayProject() {
    let that = this
    let param = {
      "area_list": {
        "isValid": true,
        "order": "sort+",
        "field": "gid,areaName,sort"
      }
    }
    app.fetch('/MiniProgram/Deposit/GetJson', {
      param: JSON.stringify(param)
    }, function (res) {
      console.log('区域', res)
      if (res.data.isSuccess) {
        let place = []
        res.data.area_list.unshift({ areaName: '全部', gid: '' })
        for (var i = 0; i < res.data.area_list.length; i++) {
          place.push(res.data.area_list[i].areaName)
        }
        that.setData({
          place: place,
          placelist: res.data.area_list
        })
        that.wayList();
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    let param = this.data.param
    param.project_list.page = 1
    this.setData({
      list: [],
      index: e.detail.value,
      param
    })
    this.wayList()
  },
  wayList() {
    wx.showLoading({ title: '加载中..', mask: true });
    let that = this
    let param = that.data.param
    param.project_list.areaId = that.data.placelist[that.data.index].gid
    app.fetch('/MiniProgram/Deposit/GetJson', {
      param: JSON.stringify(param)
    }, function (res) {
      console.log('列表', res)
      wx.hideLoading()
      if (res.data.isSuccess) {
        let list = param.project_list.page == 1 ? [] : that.data.list
        if (res.data.project_list.length > 0) {
          list = list.concat(res.data.project_list)
          param.project_list.page = param.project_list.page + 1
          that.setData({
            list: list,
            param: param,
            latest: false
          })
        } else {
          that.setData({
            list: list,
            latest: true
          })
          // wx.showToast({ title: '暂无最新数据', icon: 'none', duration: 2000 });
        }
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  listBut: function (e) {
    console.log(e.currentTarget.dataset.projid)
    wx.navigateTo({
      url: 'details?projid=' + e.currentTarget.dataset.projid + '&title=' + e.currentTarget.dataset.projname,
    })
  },
  jump() {
    if (this.data.status) {
      wx.redirectTo({
        url: '/pages/usercenter/index',
      })
    } else {
      wx.redirectTo({
        url: '/pages/usercenter/index',
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.wayProject()
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          app.onlogin().then(function (res) {
            console.log('onlogin', res)
            if (res.IsSuccess) {
              if (res.Data.unionid){
                return app.getMemberInfo(res.Data.unionid)
              } else {
                return
              }
            } else {
              wx.hideLoading()
              wx.showToast({ title: res.msg, icon: 'none', duration: 2000 });
            }
          }).then(function (res) {
            wx.hideLoading()
            console.log('getMemberInfo', res)
            if (res.IsSuccess) {
              let status = false
              if (res.Data.member) {
                app.globalData.member = res.Data.member.memberId
                app.globalData.memberData = res.Data.member
                wx.setStorageSync('member', res.Data.member.memberId)
                status = true
              }
              that.setData({
                unionid: app.globalData.data.unionid,
                userInfo: res.Data.fans,
                status: status
              })
              app.globalData.data.unionid = res.Data.fans.unionID
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
  },
  onReachBottom: function () {
    console.log('触底')
    this.wayList()
  }
})