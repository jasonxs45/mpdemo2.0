import MComponent from '../../common/MComponent'
const app = getApp()
MComponent({
  properties: {
    type: String,
    src: String,
    link: String,
  },
  data: {},
  methods: {
    onTap () {
      const { link, type } = this.data
      if (type !== 'Video') {
        return
      }
      if (!link) {
        return
      } 
      const TxvContext = requirePlugin("tencentvideo")
      let txvContext = TxvContext.getTxvContext(link)
      txvContext.play()
      txvContext.requestFullScreen()
    },
    imgLink (e) {
      const { url } = e.currentTarget.dataset
      wx.navigateTo({
        url,
        fail: err => {
          wx.reLaunch({
            url
          })
        }
      })
    }
  },
  lifetimes: {
    attached() {
    }
  }
})