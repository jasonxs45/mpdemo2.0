import MComponent from '../../common/MComponent'
import { _list } from '../../api/coupon'
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
    loading: false,
    keyword: '',
    list: [],
    pageIndex: 1,
    totalCount: 0
  },
  computed: {
    finish() {
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
    onInit(e) {
      console.log('inited')
      this.data.city = e.detail.value
      this.init()
    },
    onInput (e) {
      const { value } = e.detail
      this.data.keyword = value
    },
    init() {
      app.loading('加载中')
      let loading = false,
        pageIndex = 1,
        list = [],
        totalCount = 0
      this.set({
        loading,
        pageIndex,
        list,
        totalCount
      })
        .then(() => {
          this.initQuery()
        })
    },
    initQuery() {
      const { city, keyword: KeyWord } = this.data
      const CityID = city ? city.ID : ''
      const PageSize = 10
      const { pageIndex } = this.data
      this.set({
        loading: true
      })
      _list({ CityID, KeyWord, PageIndex: pageIndex, PageSize })
        .then(res => {
          wx.hideLoading()
          const totalCount = res.data.data ? res.data.data.Count : 0
          const list = res.data.data ? res.data.data.List : []
          this.set({
            loading: false,
            totalCount,
            list
          })
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
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
          const list = list.slice().concat(data)
          this.set({
            loading: false,
            list,
            pageIndex: PageIndex
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
    onReachLower() {
      const { currentIndex, finish } = this.data
      if (!finish) {
        this.loadMore()
      }
    },
    onLoad() {
      // this.init()
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
                wx.switchTab({
                  url: '/pages/usercenter/index'
                })
              }
            }
          })
        })
    }
  }
}, true)
