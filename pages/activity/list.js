import MComponent from '../../common/MComponent'
import { _bg, _list } from '../../api/activity'
import { formatDate } from '../../utils/util'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
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
    bg: '',
    fixed: false,
    rect: null,
    topHeight: '',
    fixedTop: 0,
    paddingBottom: '',
    keyword: '',
    projects: [],
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0
  },
  computed: {
    finished() {
      return this.data.totalCount <= this.data.list.length
    },
    showList() {
      return this.data.list.map(ele => {
        ele.AddTime = formatDate(new Date(ele.AddTime), 'yyyy-MM-dd')
        return ele
      })
    }
  },
  methods: {
    // 获取顶部浮动数据
    calcRect () {
      wx.createSelectorQuery().select('#cover').boundingClientRect(rect1 => {
        wx.createSelectorQuery().select('#top').boundingClientRect(rect2 => {
          this.set({
            topHeight: rect2.top - rect1.top,
            paddingBottom: rect2.bottom + 'px'
          })
        }).exec()
      }).exec()
    },
    getBg () {
      _bg()
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              bg: data.Image
              // bg: ''
            })
            this.calcRect()
          }
        })
        .catch(err => {
          console.log(err)
          this.calcRect()
        })
    },
    onInit (e) {
      console.log('inited')
      this.data.city = e.detail.value
      this.init()
    },
    onInput(e) {
      const { value } = e.detail
      this.data.keyword = value
    },
    onClear (e) {
      const { value } = e.detail
      this.data.keyword = value
      this.initQuery()
    },
    init() {
      app.loading('加载中')
      this.initQuery()
    },
    initQuery() {
      this.set({
        pageIndex: 1
      })
      const { city, pageIndex: PageIndex, keyword: KeyWord } = this.data
      const CityID = city ? city.ID : ''
      const PageSize = 10
      this.set({
        loading: true
      })
      console.log(CityID, KeyWord)
      _list({ CityID, KeyWord, PageIndex, PageSize })
        .then(res => {
          wx.hideLoading()
          wx.stopPullDownRefresh()
          const totalCount = res.data.data.Count
          const list = res.data.data.List
          this.set({
            loading: false,
            totalCount,
            list
          })
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
          wx.stopPullDownRefresh()
          this.set({
            loading: false
          })
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    loadMore() {
      const { pageIndex, list, keyword: KeyWord } = this.data
      let PageIndex = pageIndex + 1
      const PageSize = 10
      const { city } = this.data
      const CityID = city ? city.ID : ''
      this.set({
        loading: true
      })
      _list({ CityID, KeyWord, PageIndex, PageSize })
        .then(res => {
          const data = res.data.data.List
          const totalCount = res.data.data.Count
          let list1 = list.slice().concat(data)
          this.set({
            loading: false,
            list: list1,
            pageIndex: PageIndex,
            totalCount
          })
        })
        .catch(err => {
          console.log(err)
          this.set({
            loading: false
          })
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onLoad() {
      // this.init()
      this.getBg()
    },
    onReady () {
      this.calcRect()
      this.set({
        rect: wx.getMenuButtonBoundingClientRect()
      })
    },
    onShow() {
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          wx.hideLoading()
          if (this.data.city) {
            this.init()
          }
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
          wx.showModal({
            title: '温馨提示',
            content: '使用本功能前，请先登录',
            showCancel: false,
            success: r => {
              if (r.confirm) {
                wx.redirectTo({
                  url: '/pages/usercenter/index'
                })
              }
            }
          })
        })
    },
    onPageScroll(e) {
      const { rect, topHeight, fixed, fixedTop } = this.data
      if (e.scrollTop >= topHeight - rect.bottom - 10) {
        this.data.fixed = true
        this.data.fixedTop = -(topHeight - rect.bottom - 10)
      } else {
        this.data.fixed = false
        this.data.fixedTop = ''
      }
      // 避免频繁调用setData，只在关键变量发生变化后调用
      if (fixed !== this.data.fixed) {
        this.set({
          fixed: this.data.fixed,
          fixedTop: this.data.fixedTop
        })
      }
    },
    onPullDownRefresh() {
      this.set({
        pageIndex: 1
      })
        .then(() => {
          this.init()
        })
    },
    onReachBottom() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    },
  }
}, true)
