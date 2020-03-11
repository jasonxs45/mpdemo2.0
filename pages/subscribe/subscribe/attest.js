import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    https: app.globalData.https,
    stepCurrent: 3,
    isAuth: true,
    record: true,
    payShow: false,
    box: {
      show: false
    },
    param: {
      "owner_list": {
        "orderId": "",//条件 认购单详情
        "order": "sort+" //排序
      },
      "order": {
        "orderId": "",//条件 认购单详情
        "join": {
          "inner_join": {
            "join": "house.houseId,order.houseId",
            "field": "building,unit,floor,number,area,price"
          },
          "inner_join2": {
            "join": "project.projId,house.projectId",
            "field": "projName,isPay,deposit"
          }
        }
      }
    }
  },
  wayBoxShow(e) {
    console.log(e.currentTarget.dataset.index)
    let that = this
    let data = this.data.details[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: 'rvideo?ownerid=' + data.ownerId + '&username=' + data.ownerName + '&contact=' + data.tel + '&idcardno=' + data.idNumber
    })
  },
  waySign(e) {
    let that = this
    let data = this.data.details[e.currentTarget.dataset.index]
    if (that.data.order.contractId && data.tel) {
      that.setData({
        payShow: false,
      })
      wx.navigateTo({
        url: 'sign?contact=' + data.tel + '&contractid=' + that.data.order.contractId + '&orderid=' + that.data.param.order.orderId + '&ownerid=' + data.ownerId
      })
    } else {
      wx.showToast({ title: '缺少参数', icon: 'none', duration: 2000 });
    }
  },
  submit() {
    this.setData({
      stepCurrent: 4,
      box: {
        show: true
      }
    })
  },
  wayDetails() {
    let that = this
    let param = that.data.param
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(param)
    }, function (res) {
      console.log('协议', res)
      wx.hideLoading()
      if (res.data.isSuccess) {
        var rebels2 = res.data.owner_list.filter(function (pilot) {
          return pilot.state == '已认证';
        });
        var stepCurrent = rebels2.length == res.data.owner_list.length ? '4' : '3'
        stepCurrent = res.data.order.state == '签署协议' ? '5' : stepCurrent
        var rebels = res.data.owner_list.filter(function (pilot) {
          return !pilot.isSign
        });
        if (res.data.owner_list.length > 0 && rebels.length == 0) {
          wx.reLaunch({
            url: 'success?orderid=' + that.data.param.order.orderId
          })
        }
        that.setData({
          details: res.data.owner_list,
          order: res.data.order,
          stepCurrent: stepCurrent
        })
        if (that.data.payShow && res.data.order.state == '签署协议' && !res.data.order.contractId) {
          that.paySuccess()
        }
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  // 支付
  pay() {
    let that = this
    wx.showLoading({ title: '支付中...', mask: true });
    app.fetch('/MiniProgram/Purchase/PayOrder', {
      orderId: that.data.param.order.orderId,
      memberId: app.globalData.member
    }, function (res) {
      console.log(res)
      if (res.data.IsSuccess) {
        wx.requestPayment({
          timeStamp: res.data.Data.timeStamp,
          nonceStr: res.data.Data.nonceStr,
          package: res.data.Data.package,
          signType: res.data.Data.signType,
          paySign: res.data.Data.paySign,
          success(res) {
            wx.hideLoading()
            console.log('成功', res)
            that.setData({
              payShow: true,
              stepCurrent: 5,
              box: {
                show: false
              }
            })
            that.paySuccess()
          },
          fail(res) {
            wx.hideLoading()
            console.log('失败', res)
            wx.showToast({ title: '支付失败', icon: 'none', duration: 2000 });
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  // 支付成功
  paySuccess() {
    let that = this
    wx.showToast({ title: '正在进行房源锁定...', mask: true, icon: 'none', duration: 2000 });
    setTimeout(function () {
      that.wayDetails()
    }, 2000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (!options.orderid) {
      wx.reLaunch({
        url: '../index/index',
      })
    }
    this.data.param.owner_list.orderId = options.orderid
    this.data.param.order.orderId = options.orderid
    if (!app.globalData.member) {
      app.authorization()
    }
  },
  onShow: function () {
    let that = this
    if (!that.data.payShow) {
      wx.showLoading({ title: '加载中..', mask: true });
      this.wayDetails()
    }
  },
  onHide() {
    this.setData({
      payShow: false,
    })
  },
  onUnload() {
    this.setData({
      payShow: false,
    })
  }
})