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
        "memberId": "",
        "page": 1,
        "count": 10,
        "state_in": "认筹成功,签署协议",
        "order": "payTime-",
        "join": {
          "inner_join": {
            "join": "project.projId,order.projId",
            "field": "projName"
          }
        },
        "adviser_list": {
          "memberId": "from#order_list.staffId",
          "field": "name,tel",
          "join": {
            "inner_join": {
              "join": "fans.unionID,adviser.fansId",
              "field": "nickName,headImgUrl"
            }
          }
        }
      },
      "total_count": ""
    }
  },
  onlist(e) {
    let that = this
    let data = this.data.list[e.currentTarget.dataset.index]
    if (data.state == '认筹成功') {
      if (app.globalData.isIpx) {
        wx.navigateTo({
          url: 'pdf?pdf=' + data.filePath
        })
      } else {
        wx.downloadFile({
          url: app.globalData.https + data.filePath,
          success: function (res) {
            console.log('下载', res)
            var Path = res.tempFilePath              //返回的文件临时地址，用于后面打开本地预览所用
            wx.openDocument({
              filePath: Path,
              success: function (res) {
                console.log('打开成功');
              }
            })
          },
          fail: function (res) {
            console.log(res);
          }
        })
      }
    } else {
      wx.navigateTo({
        url: '../subscribe/attest?orderid=' + data.orderId
      })
    }
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
        that.data.param.order_list.memberId = app.globalData.member
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