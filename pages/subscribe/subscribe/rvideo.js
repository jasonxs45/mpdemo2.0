import Page from '../../../common/Page'
const app = require("../data.js")
var util = require("../index.js")
import { rengouUrl } from '../../../api/urls'
Page({
  data: {
    src: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.ownerid && options.username && options.contact && options.idcardno){
      this.setData({
        ownerid: options.ownerid,
        username: options.username,
        contact: options.contact,
        idcardno: options.idcardno
      })
      this.setData({
        src: `${rengouUrl}/h5/renlian.html?username=` + encodeURI(this.data.username) + '&contact=' + this.data.contact + '&idCardNo=' + this.data.idcardno + '&ownerid=' + this.data.ownerid
      })
    }else{
      wx.navigateBack({
        delta: 1
      })
    }
  }
})