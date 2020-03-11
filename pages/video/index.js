import Page from '../../common/Page.js'
Page({
  data: {
    vid: ''
  },
  onLoad (options) {
    this.set({
      vid: options.vid
    })
  }
})