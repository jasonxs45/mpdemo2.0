import MComponent from '../../common/MComponent'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
import { _citylist } from '../../api/projects'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      city: store => store.city,
      cityList: store => store.cityList
    }
  },
  data: {
    list: []
  },
  methods: {
    getList () {
      wx.showNavigationBarLoading()
      _citylist()
        .then(res => {
          wx.hideNavigationBarLoading()
          const { code, msg, data } = res.data
          console.log(code, msg, data)
          if (code === 0) {
            this.set({
              list: data
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
          console.log(err)
        })
    },
    updateLocation () {
      wx.getLocation({
        success: function (res) {
          const { latitude, longitude } = res
          let param = {
            location: `${latitude},${longitude}`
          }
          wx.serviceMarket.invokeService({
            service: 'wxc1c68623b7bdea7b',
            api: 'rgeoc',
            data: param
          })
            .then(res => {
              const { status, message, result } = res.data
              if (status === 0) {
                const { province, city, district } = result.address_component
                store.updateCity({
                  Name: city.replace('市', '')
                })
                console.log(this.data.city)
              } else {
                app.toast(message)
              }
            })
            .catch(err => {
              console.log(err)
            })
        },
      })
    },
    onCityTap () {
      const { city } = this.data
      store.updateCity(city)
      // wx.switchTab({
      //   url: '/pages/projects/list'
      // })
      wx.navigateBack()
    },
    onTagTap (e) {
      const { cityList } = this.data
      const { index } = e.currentTarget.dataset
      const city = cityList[index]
      store.updateCity(city)
      wx.navigateBack()
      // wx.switchTab({
      //   url: '/pages/projects/list'
      // })
    },
    onShow() {}
  }
}, true)