import Page from '../../../common/Page'
import { rengouUrl } from '../../../api/urls'
Page({
  data: {},
  onLoad: function (options) {
    console.log(options)
    if (options.contact && options.contractid && options.ownerid) {
      this.setData({
        contact: options.contact,
        contractid: options.contractid,
        ownerid: options.ownerid,
        src: `${rengouUrl}/h5/index.html?contact=` + options.contact + '&contractid=' + options.contractid + '&ownerid=' + options.ownerid
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  }
})