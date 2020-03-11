import MComponent from '../../common/MComponent'
import DEFAULT_SRC from './placeholder'
MComponent({
  properties: {
    src: {
      type: String,
      value: DEFAULT_SRC
    },
    preview: {
      type:Boolean,
      value: false
    },
    round: {
      type: Boolean,
      value: false
    },
    circle: {
      type: Boolean,
      value: false
    },
    mode: {
      type:String,
      value: 'widthFix'
    },
    lazy: {
      type:Boolean,
      value: false
    },
    longpress: {
      type: Boolean,
      value: false
    },
    group: {
      type: Array,
      value: []
    }
  },
  data: {},
  computed: {
    replace () {
      // 单个图片，路径是占位，且模式是scaleToFill时，附加samll的class
      const { src, mode, group } = this.data
      return src === DEFAULT_SRC && mode === 'scaleToFill' && !group.length
    }
  },
  methods: {
    loadHandler (e) {
      this.triggerEvent('load', e)
    },
    errorHandler (e) {
      const { currentTarget } = e
      this.set({
        src: DEFAULT_SRC
      })
      this.triggerEvent('error', e)
    },
    preview () {
      const { src, preview } = this.data
      if (!preview) {
        return
      }
      if (src === DEFAULT_SRC) {
        wx.showToast({
          icon: 'none',
          title: '图片路径无效，预览失败'
        })
        return
      }
      if (!/http(s?)\:/i.test(src)) {
        wx.showToast({
          icon: 'none',
          title: '预览失败，请使用网络地址图片'
        })
        return
      }
      let { group } = this.data
      const urls = group.length ? group.filter(item => item != DEFAULT_SRC) : [src]
      wx.previewImage({
        current: src,
        urls
      })
    }
  },
  ready () {
    const { src } = this.data
    if (!src) {
      this.set({
        src: DEFAULT_SRC
      })
    }
  }
})