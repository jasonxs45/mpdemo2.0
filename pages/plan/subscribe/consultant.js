import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    stepCurrent:1,
    list:16,
    listIndex:null,
    param: {
      "staff_list": {
        "projectId": "",
        "role": "跟办顾问",
        "field": "memberId,projectId,role",
        "join": {
          "inner_join": {
            "join": "member.memberId,staff.memberId",
            "field": "name,tel"
          },
          "inner_join2": {
            "join": "fans.unionID,member.fansId",
            "field": "headImgUrl"
          }
        }
      }
    }
  },
  calling: function (e) {
    console.log(e.currentTarget.dataset.replyPhone)
    util.calling(e.currentTarget.dataset.replyPhone)
  },
  waySelect(e) {
   this.setData({
     listIndex: e.currentTarget.dataset.index,
     staffId: this.data.list[e.currentTarget.dataset.index].memberId
   })
  },
  wayList() {
    wx.showLoading({ title: '加载中..', mask: true });
    let that = this
    let param = that.data.param
    app.fetch('/MiniProgram/Deposit/GetJson', {
      param: JSON.stringify(param)
    }, function (res) {
      console.log('列表', res)
      wx.hideLoading()
      if (res.data.isSuccess) {
        that.setData({
          list: res.data.staff_list
        })
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  submit(){
    let that = this
    if (!that.data.staffId){
      wx.showToast({ title: '请选择顾问', icon: 'none', duration: 2000 });
      return
    }
    wx.showLoading({ title: '', mask: true });
    app.fetch('/MiniProgram/Deposit/SelectStaff', {
      orderId: that.data.orderId,
      staffId: that.data.staffId
    }, function (res) {
      console.log('确定', res)
      wx.hideLoading()
      if (res.data.IsSuccess) {
        wx.redirectTo({
          url: 'form?orderid=' + that.data.orderId,
        })
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  //
  // 确定认筹
  determine(projId) {
    wx.showLoading({ title: '', mask: true });
    let that = this
    app.fetch('/MiniProgram/Deposit/CreateOrder', {
      memberId: app.globalData.member,
      projId: projId
    }, function (res) {
      console.log('认筹成功', res)
      wx.hideLoading()
      if (res.data.IsSuccess) {
        that.setData({
          orderId: res.data.Data
        })
        that.wayList()
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 5000 });
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let that = this
    if (options.projid) {
      this.data.param.staff_list.projectId = options.projid
    } else {
      wx.reLaunch({
        url: '../index/index',
      })
    }
    if (!app.globalData.member) {
      app.authorization().then(function (res) {
        console.log(res)
        if (res) {
          that.setData({
            unionid: app.globalData.data.unionid,
            userInfo: app.globalData.userInfo
          })
          that.determine(options.projid)
        } else {
          wx.reLaunch({
            url: '../index/index',
          })
        }
      })
    }else{
      that.determine(options.projid)
    }
  }
})