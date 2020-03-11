import MComponent from '../../common/MComponent'
import { _detail } from '../../api/projects'
const app = getApp()
MComponent({
  data: {
    id: ''
  },
  computed: {
    albums() {
      const { detail } = this.data
      let arr = []
      if (detail) {
        const { Project } = detail
        const { ImgGroup } = Project
        arr = ImgGroup.filter(item => Project[item.Field] && Project[item.Field].length).map(item => ({
          title: item.Text,
          imgs: Project[item.Field],
          length: Project[item.Field].length
        }))
      }
      return arr
    }
  },
  methods:{
    getDetail() {
      const { id: ID } = this.data
      wx.showNavigationBarLoading()
      _detail({ ID })
        .then(res => {
          wx.hideNavigationBarLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              detail: data
            })
          } else {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false
            })
          }
        })
        .catch(err => {
          wx.hideNavigationBarLoading()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    preview(e) {
      let { albums } = this.data
      albums = albums.map(item => item.imgs)
      const { index, index1 } = e.currentTarget.dataset
      const current = albums[index][index1]
      const urls = albums.reduce((prev, curr) => {
        return [...prev, ...curr]
      })
      wx.previewImage({
        current,
        urls
      })
    },
    onLoad(opt) {
      const { id } = opt
      this.set({
        id
      })
        .then(() => {
          this.getDetail()
        })
    }
  }
}, true)