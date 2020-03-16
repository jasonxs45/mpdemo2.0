import MComponent from '../../common/MComponent'
import { _bannber, _bg } from '../../api/home'
import { _ads } from '../../api/home'
import { _usergetlist as _serveList } from '../../api/serve'
const app = getApp()
MComponent({
  data: {
    city: null,
    bg: '',
    banners: [],
    ads: [],
    current: 0,
    adShow: false,
    ignore: false,
    max: 3,
    serveListShow: false
  },
  methods: {
    // 阻止滚定穿透
    stop () {},
    getAd() {
      const { max } = this.data
      const lasttime = wx.getStorageSync('lasttime')
      const now = Date.now()
      if (lasttime && (now - lasttime) < max * 24 * 60 * 60 * 1000) {
        return
      }
      const { city } = this.data
      const CityID = city ? city.ID : ''
      _ads({ CityID })
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              current: 0,
              ads: data
            })
              .then(() => {
                if (data.length > 0) {
                  this.set({
                    adShow: true,
                    ignore: false
                  })
                }
              })
          } else {
            console.log(msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    getBg() {
      _bg()
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              bg: data
            })
          } else {
            console.log(msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    getBanner() {
      const { city } = this.data
      const CityID = city ? city.ID : ''
      _bannber({ CityID })
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              topCurrent: 0,
              banners: data
            })
          } else {
            console.log(msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    onChange(e) {
      const { current } = e.detail
      this.set({
        current
      })
    },
    hideAd() {
      const { ignore } = this.data
      if (ignore) {
        wx.setStorageSync('lasttime', Date.now())
      } else {
        wx.removeStorageSync('lasttime')
      }
      this.set({
        adShow: false,
        current: 0
      })
    },
    toggle() {
      this.set({
        ignore: !this.data.ignore
      })
    },
    //客服顾问
    goConsult() {
      wx.navigateTo({
        url: `/pages/serve/list`
      })
    },
    //是否有客服
    serveList() {
      const PageIndex = 1
      const UnionID = wx.getStorageSync('uid')
      _serveList({ PageIndex, UnionID })
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            let serveListShow = false
            if (data.length > 0) {
              serveListShow = true
            }
            this.set({
              serveListShow
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
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onLoad(options) {
      const fromScan = options.scene
      this.data.fromScan = fromScan
      if (!fromScan) {
      } else {
      }
    },
    onShow() {
      this.getBg()
      // this.getBanner()
      this.getAd()
      wx.hideNavigationBarLoading()
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid)
        })
        .then(memberInfo => {
          this.set({
            member: memberInfo
          })
          this.serveList()
        })
        .catch(err => {
          console.log(err)
        })
    },
    onHide() {
      this.set({
        adShow: false
      })
    }
  }
}, true)
