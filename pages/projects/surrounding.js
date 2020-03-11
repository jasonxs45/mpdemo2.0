import MComponent from '../../common/MComponent'
import { _getsurrounding } from '../../api/projects'
const app = getApp()
MComponent({
  data: {
    cate: {
      '交通': '/images/trafic.png',
      '学校': '/images/school.png',
      '商业': '/images/comercial.png',
      '医疗': '/images/medical.png',
      '旅游': '/images/trip.png'
    },
    id: '',
    current: 0,
    list: [],
    center: null,
    project: null
  },
  computed: {
    markers() {
      const { current, list, center } = this.data
      let others = list[current] ? list[current][1].map(item => {
        return {
          id: item.SupportName,
          title: item.SupportName,
          latitude: item.SupportPointY,
          longitude: item.SupportPointX,
          iconPath: './mark.png',
          width: 24,
          height: 24,
          callout: {
            display: 'ALWAYS',
            bgColor: '#fff',
            content: item.SupportName,
            padding: '10px',
            borderRadius: '4'
          }
        }
      }) : []
      return [center, ...others]
    },
    currentPoints () {
      const { current, list, center } = this.data
      let others = list[current] ? list[current][1].map(item => {
        return {
          latitude: item.SupportPointY,
          longitude: item.SupportPointX,
        }
      }) : []
      let arr = [center, ...others]
      return center ? arr.map(item => ({ latitude: item.latitude, longitude: item.longitude })) : []
    }
  },
  methods: {
    onTap(e) {
      const { list } = this.data
      const { index: current } = e.currentTarget.dataset
      this.set({
        current
      })
    },
    openMap (e) {
      const { markerId } = e
      if (markerId !== 'center') {
        return
      }
      const { center, project } = this.data
      const { latitude, longitude } = center
      wx.openLocation({
        latitude,
        longitude,
        name: project.ProjectName,
        address: project.ProjectAddress
      })
    },
    getSurrounding() {
      wx.showNavigationBarLoading()
      const { id, type } = this.data
      _getsurrounding(id)
        .then(res => {
          wx.hideNavigationBarLoading()
          const { code, msg, data } = res.data
          let project = data.Project
          let list = Object.entries(data.Point)
          list = list.map(item => {
            return item
          })
          let current = list.findIndex(item => item[0] === type) === - 1 ? 0 : list.findIndex(item => item[0] === type)
          if (code === 0) {
            let center = {
              id: 'center',
              zIndex: 2,
              bgColor: '#fff',
              latitude: project.AddressPointY,
              longitude: project.AddressPointX,
              callout: {
                display: 'ALWAYS',
                content: project.ProjectAddress,
                fontSize: 14,
                padding: '12px',
                borderRadius: '4'
              }
            }
            this.set({
              list,
              current,
              project,
              center
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
          console.log(err)
          wx.hideNavigationBarLoading()
        })
    },
    onLoad(options) {
      const { id, type } = options
      this.set({
        id,
        type: type || ''
      })
      this.getSurrounding()
    },
    onReady() { },
    onShow() { }
  }
})