import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
Page({
  data: {
    box: {
      show: false
    },
    stepCurrent: 2,
    paramindex: 4,
    paramMain: [true],
    region: ['', '', ''],
    customItem: '',
    param1: {
      "order": {
        "orderId": "",
        "join": {
          "inner_join": {
            "join": "project.projId,order.projId",
            "field": "projName,isPay"
          }
        }
      }
    },
    param: {
      orderId: '',
      ownerName: [''],
      tel: [''],
      idNumber: [''],
      cardAddress: [''],
      email: '',
      provinceCity: '',
      roadSigns: '',
      postalCode: '',
    }
  },
  deleteClient(e) {
    this.data.paramMain.splice(e.currentTarget.dataset.index, 1)
    this.data.param.ownerName.splice(e.currentTarget.dataset.index, 1)
    this.data.param.tel.splice(e.currentTarget.dataset.index, 1)
    this.data.param.idNumber.splice(e.currentTarget.dataset.index, 1)
    this.data.param.cardAddress.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      paramMain: this.data.paramMain,
      param: this.data.param
    })
  },
  // 添加客户
  addClient(e) {
    console.log(e.currentTarget.dataset.index)
    this.data.paramMain.push(true)
    this.data.param.ownerName.push('')
    this.data.param.tel.push('')
    this.data.param.idNumber.push('')
    this.data.param.cardAddress.push('')
    this.setData({
      paramMain: this.data.paramMain,
      param: this.data.param
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  // 输入框修改
  onBindinput: function (e) {
    let param = this.data.param
    let attribute = e.currentTarget.dataset.index
    if (e.currentTarget.dataset.number || e.currentTarget.dataset.number >= 0) {
      param[attribute][e.currentTarget.dataset.number] = e.detail.value
    } else {
      param[attribute] = e.detail.value
    }
    this.setData({
      param
    })
  },
  // 输入框删除
  clear: function (e) {
    let param = this.data.param
    let attribute = e.currentTarget.dataset.index
    if (e.currentTarget.dataset.number || e.currentTarget.dataset.number >= 0) {
      param[attribute][e.currentTarget.dataset.number] = ''
    } else {
      param[attribute] = ''
    }
    this.setData({
      param
    })
  },
  submit() {
    let that = this
    let param = JSON.parse(JSON.stringify(that.data.param));
    // if (!param.ownerName[0] || param.ownerName[0] == '') {
    var text = ''
    for (var i = 0; i < that.data.paramMain.length; i++) {
      if (!util.checkName(param.ownerName[i])) {
        text = i == 0 ? '请填写2-6中文姓名' : '请填写客户' + (i + 1) + '的中文姓名'
        wx.showToast({ title: text, icon: 'none', duration: 2000 });
        return
      }
      if (!util.checkPhone(param.tel[i])) {
        text = i == 0 ? '请填写正确的手机号码' : '请填写客户' + (i + 1) + '正确的手机号码'
        wx.showToast({ title: text, icon: 'none', duration: 2000 });
        return
      }
      // if (!param.idCard || param.idCard == '') {
      if (!util.checkIdCard(param.idNumber[i])) {
        text = i == 0 ? '请填写身份证号' : '请填写客户' + (i + 1) + '正确的身份证号'
        wx.showToast({ title: text, icon: 'none', duration: 2000 });
        return
      }
      if (!param.cardAddress[i] || param.cardAddress[i] == '') {
        text = '请填写的身份证地址'
        text = i == 0 ? '请填写身份证地址' : '请填写客户' + (i + 1) + '的身份证地址'
        wx.showToast({ title: text, icon: 'none', duration: 2000 });
        return
      }
      if (i > 0) {
        if (param.ownerName[i] == param.ownerName[i - 1]) {
          wx.showToast({ title: '客户名不能相同', icon: 'none', duration: 2000 });
          return
        }
        if (param.tel[i] == param.tel[i - 1]) {
          wx.showToast({ title: '手机号码不能相同', icon: 'none', duration: 2000 });
          return
        }
        if (param.idNumber[i] == param.idNumber[i - 1]) {
          wx.showToast({ title: '身份证号不能相同', icon: 'none', duration: 2000 });
          return
        }
      }
    }
    if (!util.checkEmail(param.email)) {
      // if (!param.email || param.email == '') {
      // text = '请填写电子邮箱'
      // wx.showToast({ title: text, icon: 'none', duration: 2000 });
      return
    }
    var rebels = that.data.region.filter(function (pilot) {
      return pilot == '';
    });
    console.log(rebels)
    if (rebels.length > 0) {
      text = '请选择所在省市区'
      wx.showToast({ title: text, icon: 'none', duration: 2000 });
      return
    }
    param.provinceCity = that.data.region[0] + that.data.region[1] + that.data.region[2]
    // if (!param.provinceCity || param.provinceCity == '') {
    //   var text = '所在省市区'
    //   wx.showToast({ title: text, icon: 'none', duration: 2000 });
    //   return
    // }
    if (!param.roadSigns || param.roadSigns == '') {
      text = '请填写街道地址'
      wx.showToast({ title: text, icon: 'none', duration: 2000 });
      return
    }
    // if (!param.postalCode || param.postalCode == '') {
    if (!util.checkPostal(param.postalCode)) {
      text = '请填写正确邮政编码'
      wx.showToast({ title: text, icon: 'none', duration: 2000 });
      return
    }
    var ownerName = param.ownerName
    var tel = param.tel
    var idNumber = param.idNumber
    var cardAddress = param.cardAddress
    // if (that.data.paramindex == 0) {
    //   ownerName = [param.ownerName[0]]
    //   tel = [param.tel[0]]
    //   idNumber = [param.idNumber[0]]
    //   cardAddress = [param.cardAddress[0]]
    // }
    param.ownerName = JSON.stringify(ownerName)
    param.tel = JSON.stringify(tel)
    param.idNumber = JSON.stringify(idNumber)
    param.cardAddress = JSON.stringify(cardAddress)
    console.log(param)
    // return
    wx.showLoading({ title: '提交中..', mask: true });
    app.fetch('/MiniProgram/Deposit/AddOwner', param, function (res) {
      wx.hideLoading()
      console.log('提交', res)
      if (res.data.IsSuccess) {
        wx.redirectTo({
          url: 'attest?orderid=' + that.data.param.orderId,
        })
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  // 支付
  pay() {
    let that = this
    app.fetch('/MiniProgram/Deposit/PayOrder', {
      orderId: that.data.param.orderId,
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
            console.log('成功', res)
            that.paySuccess()
          },
          fail(res) {
            console.log('失败', res)
            wx.navigateBack({
              delta: 2
            })
          }
        })
      } else {
        wx.showToast({ title: res.data.Msg, icon: 'none', duration: 2000 });
      }
    })
  },
  // 支付成功
  paySuccess() {
    let that = this
    wx.showToast({ title: '正在进行房源锁定...', mask: true, icon: 'none', duration: 3000 });
    setTimeout(function () {
      wx.navigateTo({
        url: 'attest?orderid=' + that.data.param.orderId,
      })
      wx.hideLoading()
    }, 3000);
  },
  wayDetails() {
    wx.showLoading({ title: '加载中..', mask: true });
    let that = this
    let param = that.data.param1
    app.fetch('/MiniProgram/Deposit/GetJson', {
      param: JSON.stringify(param)
    }, function (res) {
      console.log(res)
      wx.hideLoading()
      if (res.data.isSuccess) {
        that.setData({
          paramindex: res.data.order.ownerNum ? res.data.order.ownerNum : 1,
          details: res.data.order,
        })
      } else {
        wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 });
      }
    })
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
    this.data.param1.order.orderId = options.orderid
    this.data.param.orderId = options.orderid
    this.wayDetails()
    console.log(app.globalData)
    this.data.param.ownerName[0] = app.globalData.memberData ? app.globalData.memberData.name : ''
    this.data.param.tel[0] = app.globalData.memberData ? app.globalData.memberData.tel : ''
    this.setData({
      param: this.data.param
    })
  }
})