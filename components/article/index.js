import MComponent from '../../common/MComponent'
const WxParse = require('wxParse/wxParse.js')
MComponent({
  properties: {
    words: {
      type: String,
      observer: 'updateContent'
    }
  },
  data: {},
  methods: {
    updateContent () {
      const { words } = this.data
      WxParse.wxParse('content', 'html', words, this, 0)
    }
  },
  ready () {
    this.updateContent()
  }
})
