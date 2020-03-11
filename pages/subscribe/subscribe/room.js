import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    stepCurrent: 1,
    list: [],
    floor: [],
    floorIndex: 0,
    floorHeight: [],
    place: [],
    index: 0,
    place3: [],
    index3: 0,
    place4: [],
    index4: 0,
    param: {
      "house_distinct": {
        "projectId": "", //条件 项目gid
        "field": "building",
        "order": "building+"
      }
    },
    param1: {
      "house_distinct": {
        "projectId": "", //参数 项目ID
        "building": "", //参数 楼栋
        "field": "unit",
        "order": "unit+"
      }
    },
    param3: {
      "house_distinct": {
        "projectId": "", //参数 项目ID
        "building": "", //参数 楼栋
        "unit": "",//条件 单元
        "field": "floor",
        "order": "floor+"
      }
    },
    param2: {
      "project": {
        "projId": "",//条件  项目ID
        "field": "projId,projName,state,thumbnail"
      },
      "house_list": {
        "projectId": "from#project.projId",
        "building": "",//条件 楼栋
        "floor": "",//条件 楼层
        "unit": "",//条件 单元
        "apartment": "",//条件 户型
        "page": 1,//当前页数
        "count": 10,//每页条数
        "isDisplay": true,
        "order": "sort+",
        "field": "houseId,building,unit,floor,number,apartment,state,thumbnail,area,price,sort"
      },
      "total_count": ""
    },
  },
  wayFloor(e) {
    this.setData({
      floorIndex: e.currentTarget.dataset.index,
      toView: this.data.floor[e.currentTarget.dataset.index]
    })
  },
  wayControl(e) {
    console.log(e)
    let that = this
    wx.showModal({
      title: '',
      content: '请确认是否销控该房源',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.determine(e.currentTarget.dataset.houseid)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 确定房源
  determine(houseId) {
    wx.showLoading({ title: '', mask: true });
    let that = this
    app.fetch('/MiniProgram/Purchase/CreateOrder', {
      memberId: app.globalData.member,
      houseId: houseId
    }, function (res) {
      console.log('确定', res)
      wx.hideLoading()
      if (res.data.IsSuccess) {
        wx.redirectTo({
          url: 'consultant?orderid=' + res.data.Data + '&projectid=' + that.data.param.house_distinct.projectId,
        })
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  scrollHeight(e) {
    let that = this
    wx.createSelectorQuery().selectAll('#f' + e).boundingClientRect(function (rect) {
      that.data.floorHeight.push(rect[0].top)
    }).exec()
  },
  // 滚动时触发
  scroll(e) {
    // console.log(e.detail.scrollTop)
    var top = e.detail.scrollTop
    for (var i = 0; i < this.data.floorHeight.length; i++) {
      if (top <= this.data.floorHeight[i] - this.data.floorHeight[0]) {
        this.setData({
          floorIndex: i - 1
        })
        return
      }
    }
  },
  // 滚动到底部
  lower(e) {
    // console.log(e)
    this.wayList()
  },
  floor() {
    let that = this
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param)
    }, function (res) {
      if (res.data.isSuccess) {
        let place = []
        console.log('楼', res.data)
        res.data.house_distinct.unshift('楼栋')
        that.setData({
          place: res.data.house_distinct,
        })
        that.floor2()
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  floor2() {
    let that = this
    wx.showLoading({ title: '加载中..', mask: true });
    that.data.param1.house_distinct.building = that.data.index == 0 ? '' : that.data.place[that.data.index]
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param1)
    }, function (res) {
      if (res.data.isSuccess) {
        let place = []
        function sortNumber(a, b) {
          return parseInt(a) - parseInt(b)
        }
        res.data.house_distinct.sort(sortNumber)
        console.log('单元', res.data.house_distinct)
        res.data.house_distinct.unshift('单元')
        that.setData({
          place3: res.data.house_distinct,
          index3: 0
        })
        that.data.param2.house_list.unit = ''
        // that.wayList()
        that.floor3()
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  floor3() {
    let that = this
    wx.showLoading({ title: '加载中..', mask: true });
    that.data.param3.house_distinct.building = that.data.index == 0 ? '' : that.data.place[that.data.index]
    that.data.param3.house_distinct.unit = that.data.index3 == 0 ? '' : that.data.place3[that.data.index3]
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param3)
    }, function (res) {
      if (res.data.isSuccess) {
        let place = []
        function sortNumber(a, b) {
          return parseInt(a) - parseInt(b)
        }
        res.data.house_distinct.sort(sortNumber)
        console.log('楼层', res.data.house_distinct)
        res.data.house_distinct.unshift('楼层')
        that.setData({
          place4: res.data.house_distinct,
          index4: 0
        })
        that.data.param2.house_list.floor = ''
        that.wayList()
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  wayList() {
    let that = this
    wx.showLoading({
      title: '加载中..',
      mask: true
    });
    app.fetch('/MiniProgram/Purchase/GetJson', {
      param: JSON.stringify(that.data.param2)
    }, function (res) {
      wx.hideLoading()
      console.log('房源', res)
      if (res.data.isSuccess) {
        let list = that.data.param2.house_list.page == 1 ? [] : that.data.list
        if (res.data.house_list.length > 0) {
          list = list.concat(res.data.house_list)
          that.data.param2.house_list.page++;
          that.setData({
            project: res.data.project,
            list: list,
            latest: false
          })
        } else {
          that.setData({
            list: list,
            latest: true
          })
          // wx.showToast({ title: '暂无最新数据', icon: 'none', duration: 2000 });
        }
        var floor = []
        for (var i = 0; i < list.length; i++) {
          if (floor.indexOf(list[i].floor) == -1) {
            floor.push(list[i].floor);
          }
        }
        that.setData({
          floor
        })
        console.log(floor)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.data.param2.house_list.building = e.detail.value == 0 ? '' : this.data.place[e.detail.value]
    this.data.param2.house_list.page = 1
    this.setData({
      index: e.detail.value
    })
    this.floor2()
  },
  bindPickerChange1: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.data.param2.house_list.unit = e.detail.value == 0 ? '' : this.data.place3[e.detail.value]
    this.data.param2.house_list.page = 1
    this.setData({
      index3: e.detail.value
    })
    this.floor3()
    // this.wayList()
  },
  bindPickerChange2: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.data.param2.house_list.floor = e.detail.value == 0 ? '' : this.data.place4[e.detail.value]
    this.data.param2.house_list.page = 1
    this.setData({
      index4: e.detail.value
    })
    this.wayList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.projid, app.globalData)
    if (!app.globalData.member) {
      wx.reLaunch({
        url: '../index/index',
      })
    }
    if (options.projid) {
      this.data.param.house_distinct.projectId = options.projid
      this.data.param1.house_distinct.projectId = options.projid
      this.data.param3.house_distinct.projectId = options.projid
      this.data.param2.project.projId = options.projid
      this.floor()
    } else {
      wx.reLaunch({
        url: '../index/index',
      })
    }
    let that = this
    app.authorization().then(function (res) {
      console.log(res)
      if (res) {
        that.setData({
          unionid: app.globalData.data.unionid,
          userInfo: app.globalData.userInfo
        })
      } else {
        wx.reLaunch({
          url: '../index/index',
        })
      }
    })
  },
  onShow: function () {
    let that = this
    that.data.floorHeight = []
    for (var i = 0; i < that.data.floor.length; i++) {
      this.scrollHeight(that.data.floor[i])
    }
  }
})