import Page from '../../../common/Page'
const app = require("../data.js")
Page({
  data: {
    src:''
  },
  onLoad: function (options) {
    console.log('pdf')
    this.setData({
      src: app.globalData.https+options.pdf
    })
  }
})