import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    memberId: null,
    latest: true,
    list: [],
    param: {
      "order_list": {
        "staffId": "",//参数  当前跟办顾问 MemberId
        "page": 1,
        "count": 10,
        "state_in": "认购成功,签署协议",
        "order": "payTime-",
        "join": {
          "inner_join": {
            "join": "project.projId,order.projId",
            "field": "projName"
          },
          "inner_join2": {
            "join": "member.memberId,order.memberId",
            "field": "name,tel"
          }
        }
      },
      "total_count": ""
    }
  },
  onlist(e) {
    let that = this
    let data = this.data.list[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: 'details?orderid=' + data.orderId
    })
  },
  calling: function (e) {
    console.log(e.currentTarget.dataset.replyPhone)
    util.calling(e.currentTarget.dataset.replyPhone)
  },
  wayList() {
    let that = this
    wx.showLoading({ title: '加载中..', mask: true });
    app.fetch('/MiniProgram/Deposit/GetJson', {
      param: JSON.stringify(that.data.param)
    }, function (res) {
      wx.hideLoading()
      console.log('list', res)
      if (res.data.isSuccess) {
        if (res.data.order_list.length > 0) {
          let list = that.data.param.order_list.page == 1 ? [] : that.data.list
          list = list.concat(res.data.order_list)
          that.data.param.order_list.page++
          that.setData({
            list: list,
            latest: false
          })
        } else {
          that.setData({
            latest: true
          })
        }
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  onLoad: function (options) {
    console.log(app.globalData)
    let that = this
    app.authorization().then(function (res) {
      console.log(res)
      if (res) {
        that.data.memberId = app.globalData.member
        that.data.param.order_list.staffId = app.globalData.member
        that.data.param.order_list.page = 1
        that.wayList()
      } else{
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  onReachBottom: function () {
    console.log('触底')
    this.wayList()
  }
})