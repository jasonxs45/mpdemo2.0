import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    memberId: null,
    expand:true,
    statusIndex:0,
    boxShow:false,
    param: {
      "order": {
        "orderId": ""
      },
      "member": {
        "memberId": "from#order.memberId",
        "join": {
          "inner_join": {
            "join": "fans.unionID,member.fansId",
            "field": "nickName,headImgUrl"
          }
        }
      },
      "house": {
        "houseId": "from#order.houseId"
      },
      "project": {
        "projId": "from#house.projectId",
        "field": "projName"
      },
      "owner_list": {
        "orderId": "from#order.orderId"
      },
      "staff": {
        "memberId": "from#order.staffId",
        "join": {
          "inner_join": {
            "join": "member.memberId,staff.memberId",
            "field": "name,tel"
          },
          "inner_join2": {
            "join": "fans.unionID,member.fansId",
            "field": "nickName,headImgUrl,sex"
          }
        }
      }
    },
    param2: {
      "dic_list": {
        "type": "跟办状态",//条件 字典类型
        "order": "sort+",
        "field": "name,value,sort"
      }
    },
    param3:{
      "worklog_list": {
        "orderId": "",
        "order": "addTime-"
      }
    },
    paramSubmit: {
      memberId: '',
      orderId: '',
      state: '',
      desc: '',
    }
  },
  wayBox(){
    this.setData({
      boxShow: !this.data.boxShow
    })
  },
  calling: function (e) {
    console.log(e.currentTarget.dataset.replyPhone)
    util.calling(e.currentTarget.dataset.replyPhone)
  },
  wayExpand() {
    this.setData({
      expand: !this.data.expand
    })
  },
  bindRegionChange: function (e) {
    this.setData({
      statusIndex: e.detail.value
    })
  },
  wayStatus(){
    let that = this
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param2)
    }, function (res) {
      console.log(res)
      if (res.data.isSuccess) {
        var statusList = res.data.dic_list.map(function (pilot) {
          return pilot.name;
        });
        // console.log(statusList)
        statusList.unshift('请选择')
        that.setData({
          statusList: statusList
        })
      }
    })
  },
  wayDetails() {
    let that = this
    wx.showLoading({ title: '加载中..', mask: true });
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param)
    }, function (res) {
      wx.hideLoading()
      console.log('list', res)
      if (res.data.isSuccess) {
        that.setData({
          list: res.data.owner_list,
          details: res.data.house,
          project: res.data.project,
          order: res.data.order,
          memberId: res.data.member.memberId,
        })
        that.data.param3.worklog_list.orderId = res.data.order.orderId
        that.wayJournal()
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  wayJournal(){
    let that = this
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param3)
    }, function (res) {
      console.log('日志', res)
      if (res.data.isSuccess) {
        that.setData({
          journal: res.data.worklog_list,
        })
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
  },
  onBindinput: function (e) {
    let paramSubmit = this.data.paramSubmit
    let attribute = e.currentTarget.dataset.index
    paramSubmit[attribute] = e.detail.value
    this.setData({
      paramSubmit
    })
  },
  submit(){
    let that = this
    if (that.data.statusIndex==0){
      wx.showToast({ title: '请选择更新状态', icon: 'none', duration: 2000 });
      return
    }
    that.data.paramSubmit.memberId = that.data.memberId
    that.data.paramSubmit.orderId = that.data.order.orderId
    that.data.paramSubmit.state = that.data.statusList[that.data.statusIndex]
    wx.showLoading({ title: '提交中..', mask: true });
    app.fetch('/MiniProgram/Purchase/FollowUp', that.data.paramSubmit, function (res) {
      wx.hideLoading()
      console.log('提交', res)
      if (res.data.IsSuccess) {
        that.wayBox()
        that.wayJournal()
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  onLoad: function (options) {
    console.log(app.globalData, options)
    let that = this
    that.data.param.order.orderId = options.orderid
    that.wayDetails()
    that.wayStatus()
  }
})