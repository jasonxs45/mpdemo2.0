import MComponent from '../../common/MComponent'
import { _mapQuery } from '../../api/projects'
const app = getApp()
MComponent({
  data: {
    current: 0,
    list: [],
    area: [],
    scale: 10,
    center: {
      latitude: 34.957995,
      longitude: 114.433594,
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
    openMap(e) {
      const { markerId } = e
      const { markers, list } = this.data
      // 956d37
      let markersX = markers.map(item => {
        if (item.id == markerId) {
          item.callout.bgColor = '#eba246'
          item.callout.color = '#fff'
        } else {
          item.callout.bgColor = '#fff'
          item.callout.color = '#000'
        }
        return item
      })
      let projects = []
      list.filter(item => {
        let data = item[1].filter(off => {
          if (off.ID == markerId) {
            projects[0] = off
          }
          return off.ID == markerId
        })
        return data.length > 0
      })
      this.set({
        markers: markersX,
        projects
      })
      // wx.navigateTo({
      //   url: '/pages/projects/detail?id=' + markerId,
      // })
    },
    regionchange(e) {
      if (e.causedBy == 'scale') {
        let mapCtx = wx.createMapContext("map");
        mapCtx.getScale({
          success: function (res) {
            let scale = parseInt(res.scale);
            // console.log(res)
          }
        })
      }
    },
    wayMarkers(item) {
      return {
        id: item.ID,
        title: item.ProjectName,
        latitude: item.AddressPointY,
        longitude: item.AddressPointX,
        iconPath: './mark.png',
        width: 24,
        height: 24,
        callout: {
          display: 'ALWAYS',
          bgColor: '#fff',
          color: '#000',
          content: item.ProjectName,
          padding: '10px',
          borderRadius: '4'
        }
      }
    },
    getSurrounding() {
      wx.showNavigationBarLoading()
      const { type } = this.data
      _mapQuery()
        .then(res => {
          wx.hideNavigationBarLoading()
          const { code, msg, data } = res.data
          let list = Object.entries(data)
          list = list.map(item => {
            return item
          })
          if (code === 0) {
            let index = 0
            let area = list.map((item, index) => {
              return {
                ID: index + 1,
                ProjectName: item[0],
                AddressPointY: item[1][0].AddressPointY,
                AddressPointX: item[1][0].AddressPointX,
              }
            })
            let center = type == '' ? {} : {
              latitude: list[0][1][0].AddressPointY,
              longitude: list[0][1][0].AddressPointX,
            }
            if (type == '') {
              center = {
                latitude: list[0][1][0].AddressPointY,
                longitude: list[0][1][0].AddressPointX,
              }
            } else {
              area.findIndex(item => {
                if (item.ProjectName == type) {
                  center = {
                    latitude: item.AddressPointY,
                    longitude: item.AddressPointX,
                  }
                }
                return
              })
            }
            let markers = []
            let markersZ = list.map(item => {
              return item[1]
            }).findIndex(item => {
              markers = markers.concat(item)
            })
            markers = markers.map(this.wayMarkers)

            this.set({
              list,
              area,
              markers,
              center,
              scale: type == '' || type == '全国' ? 6 : 10
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
      const { type } = options
      console.log(type)
      this.set({
        type: type || ''
      })
      this.getSurrounding()
    },
    onReady() { },
    onShow() { }
  }
}, true)  