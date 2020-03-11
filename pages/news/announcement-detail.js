import Page from '../../common/Page'
import { _detail } from '../../api/news'
const app = getApp()
Page({
  data: {
    code: '',
    content: ''
  },
  initQuery() {
    wx.showNavigationBarLoading()
    const { code } = this.data
    _detail(code)
      .then(res => {
        wx.hideNavigationBarLoading()
        const { code, msg, data } = res.data
        if (code != 0) {
          wx.showModal({
            title: '对不起',
            content: msg,
            showCancel: false,
            success: r => {
              if (r.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          this.set({
            content: data
          })
          wx.setNavigationBarTitle({
            title: data.Title || '详情'
          })
        }

      })
      .catch(err => {
        console.log(err)
        wx.hideNavigationBarLoading()
        wx.showModal({
          title: '对不起',
          content: JSON.stringify(err),
          showCancel: false
        })
      })
  },
  onLoad(opt) {
    this.data.code = opt.code
    this.initQuery()
  }
})
