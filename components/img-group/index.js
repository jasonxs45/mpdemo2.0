import MComponent from '../../common/MComponent'
import DEFAULT_SRC from '../img/placeholder'
MComponent({
  properties: {
    value: {
      type: null
    },
    readOnly: {
      type: Boolean,
      value: false
    },
    count: {
      type: Number,
      value: 9
    }
  },
  data: {
    localPathes: [],
    previewImageUrls: []
  },
  methods: {
    updateValue (val) {
    },
    onError (e) {
      const index = Number(e.currentTarget.dataset.index)
      let { value } = this.data
      value[index] = DEFAULT_SRC
      this.set({
        value
      })
    },
    clear (e) {
      const index = Number(e.currentTarget.dataset.index)
      let { value } = this.data
      value.splice(index,1)
      this.triggerEvent('change', { value })
    },
    chooseImg () {
      let { count, value } = this.data
      wx.chooseImage({
        count: count - value.length,
        success: res => {
          const imgs = res.tempFilePaths
          const value = this.data.localPathes.concat(imgs)
          this.set({
            value
          })
        },
        fail: err => {}
      })
    },
    upload () {
      wx.uploadFile({
        url: '',
        filePath: '',
        name: '',
      })
    }
  }
})