import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    stepCurrent:6,
    param: {
      "owner_list": {
        "orderId": "",//条件 认购单详情
        "order": "sort+" //排序
      },
      "order": {
        "orderId": ""//条件 认购单详情
      }
    }
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
        that.setData({
          details: res.data.owner_list,
          order: res.data.order
        })
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  waySign(e) {
    let that = this
    let data = this.data.details[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: 'sign?contact=' + data.tel + '&contractid=' + that.data.order.contractId + '&orderid=' + that.data.param.order.orderId + '&ownerid=' + data.ownerId
    })
  },
  jump() {
    wx.reLaunch({
      url: '/pages/usercenter/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.data.param.owner_list.orderId = options.orderid
    this.data.param.order.orderId = options.orderid
    this.wayDetails()
  }
})