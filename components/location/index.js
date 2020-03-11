import MComponent from '../../common/MComponent'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
import { _locate, _citylist } from '../../api/projects'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      city: store => store.city
    }
  },
  data: {
    loading: false,
    country: true,
    list: []
  },
  methods: {
    _init () {
      app.loading('获取位置中')
      app.getSysConf()
        .then(res => {
          store.updateSysConf(res)
          const { ProjectShowType } = res
          this.set({
            country: ProjectShowType === 'Country'
          })
            .then(() => {
              this.init()
            })
        })
        .catch(err => {
          console.log('获取配置失败', err)
          this.init()
        })
    },
    init() {
      const { country } = this.data
      console.log(country?'配置为全国':'配置为城市')
      if (!store.city) {
        console.log('内存中没有城市，正常请求定位授权')
        wx.getLocation({
          success: r => {
            console.log('同意授权地理位置')
            // 同意授权位置
            const { latitude, longitude } = r
            let stack = [_citylist()]
            let param = {
              location: `${latitude},${longitude}`
            }
            let p = wx.serviceMarket.invokeService({
              service: 'wxc1c68623b7bdea7b',
              api: 'rgeoc',
              data: param
            })
            stack.push(p)
            this.set({
              loading: true
            })
            app.loading('获取位置中')
            Promise.all(stack.map(p => p.catch(e => e)))
              .then(res => {
                console.log(res)
                this.set({
                  loading: false
                })
                wx.hideLoading()
                let _city, _list
                // 处理城市列表
                const { code, msg, data } = res[0].data
                if (code === 0) {
                  _list = data.map(item => item.Name)
                  data.unshift({
                    Name: '全国',
                    ID: ''
                  })
                  this.set({
                    list: data
                  })
                  store.updateCityList(data)
                } else {
                  app.toast(msg)
                }
                // 获取当前定位
                if (res[1] instanceof Error && this.data.list) {
                  let target = this.data.list[0]
                  store.updateCity(target)
                  this.triggerEvent('inited', { value: target })
                } else {
                  const { status, message, result } = res[1].data
                  if (status === 0) {
                    let { city } = result.address_component
                    _city = city.replace('市', '')
                    console.log(`定位在${_city}`)
                  } else {
                    app.toast(message)
                  }
                  // 匹配城市列表
                  let target = country ? this.data.list[0] : this.data.list.find(item => item.Name === _city)
                  if (!target) {
                    target = this.data.list[0]
                    store.updateCity(target)
                    this.triggerEvent('inited', { value: target })
                  } else {
                    store.updateCity(target)
                    this.triggerEvent('inited', { value: target })
                  }
                }
              })
              .catch(err => {
                console.log(err)
                this.set({
                  loading: false
                })
                wx.hideLoading()
              })
          },
          fail: e => {
            console.log('不同意授权地理位置')
            // 不同意授权位置，直接请求城市列表
            console.log(e)
            this.set({
              loading: true
            })
            app.loading('获取位置中')
            _citylist()
              .then(res => {
                this.set({
                  loading: false
                })
                wx.hideLoading()
                // 处理城市列表
                const { code, msg, data } = res.data
                if (code === 0) {
                  data.unshift({
                    Name: '全国',
                    ID: ''
                  })
                  this.set({
                    list: data
                  })
                  store.updateCity(data[0])
                  store.updateCityList(data)
                  this.triggerEvent('inited', { value: data[0] })
                } else {
                  app.toast(msg)
                }
              })
              .catch(err => {
                console.log(err)
              })
          }
        })
      } else {
        console.log('内存中有城市，取消定位授权，直接查询城市列表匹配')
        _citylist()
          .then(res => {
            const { code, msg, data } = res.data
            if (code === 0) {
              data.unshift({
                Name: '全国',
                ID: ''
              })
              let city = data.find(item => item.Name === store.city.Name)
              city = city || data[0]
              this.set({
                list: data
              })
              store.updateCity(city)
              store.updateCityList(data)
              this.triggerEvent('inited', { value: city })
            } else {
              app.toast(msg)
            }
          })
          .catch(err => {
            console.log()
            app.toast(JSON.stringify(err))
          })
      }
    },
    getList() {
      _citylist()
        .then(res => {
          this.set({
            loading: false
          })
          wx.hideLoading()
          const { code, msg, data } = res.data
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
          this.set({
            loading: false
          })
          wx.hideLoading()
          console.log(err)
        })
    },
    updateLocation() {
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
  },
  lifetimes: {
    ready() {
      this._init()
    }
  },
})