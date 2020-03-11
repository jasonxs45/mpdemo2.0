import MComponent from '../../common/MComponent'
const app = getApp()
MComponent({
  data: {
    src: ''
  },
  methods: {
    onLoad(opt) {
      const { src } = opt
      console.log(src)
      if (!src) {
        wx.showModal({
          title: '温馨提示',
          content: '路径参数错误',
          showCancel: false,
          success: r => {
            wx.navigateBack()
          }
        })
      } else {
        this.set({
          src: decodeURIComponent(src)
        })
      }
    }
  }
}, true)