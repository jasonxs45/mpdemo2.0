import MComponent from '../../common/MComponent'
import { _list } from '../../api/activity'
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
    currentIndex: 0,
    tabs: [],
    loading: [],
    lists: [],
    pageIndexes: [],
    totalCount: []
  },
  computed: {
    finishes() {
      return this.data.totalCount.map((item, index) => {
        return item <= (this.data.lists[index] ? this.data.lists[index].length : 0)
      })
    },
    showLists() {
      return this.data.lists.map(item => {
        return item.map(ele => {
          ele.AddTime = formatDate(new Date(ele.AddTime), 'yyyy-MM-dd')
          return ele
        })
      })
      return this.data.lists
    }
  },
  methods: {
    onInit (e) {
      console.log('inited')
      this.data.city = e.detail.value
      this.init()
    },
    onChange(e) {
      const { value, current } = e.detail
      this.set({
        currentIndex: current === undefined ? value : current
      })
    },
    init() {
      app.loading('加载中')
      const data = {
        "进行中": "进行中",
        "已结束": "已结束"
      }
      let tabs = [],
        loading = [],
        pageIndexes = [],
        lists = [],
        totalCount = []
      for (let n in data) {
        tabs.push({
          text: n,
          value: data[n]
        })
        loading.push(false)
        pageIndexes.push(1)
        lists.push([])
        totalCount.push(0)
      }
      this.set({
        tabs,
        loading,
        pageIndexes,
        lists,
        totalCount
      })
        .then(() => {
          this.initQuery()
        })
    },
    initQuery() {
      const { city } = this.data
      const CityID = city ? city.ID : ''
      const PageSize = 10
      const { currentIndex, tabs, pageIndexes } = this.data
      const funcs = pageIndexes.map((item, index) => _list({ CityID, State: tabs[index].value, PageIndex: item, PageSize }))
      this.set({
        [`loading[${currentIndex}]`]: true
      })
      Promise.all(funcs)
        .then(res => {
          wx.hideLoading()
          const totalCount = res.map(item => {
            let count = item.data.data ? item.data.data.Count : 0
            return count
          })
          const lists = res.map(item => {
            let list = item.data.data ? item.data.data.List : []
            return list
          })
          this.set({
            [`loading[${currentIndex}]`]: false,
            totalCount,
            lists
          })
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
          this.set({
            [`loading[${currentIndex}]`]: false
          })
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    loadMore(current) {
      const { tabs, pageIndexes, lists } = this.data
      let PageIndex = pageIndexes[current] + 1
      const PageSize = 10
      const { city } = this.data
      const CityID = city ? city.ID : ''
      this.set({
        [`loading[${current}]`]: true
      })
      _list({ CityID, State: tabs[current].value, PageIndex, PageSize })
        .then(res => {
          const data = res.data.data.List
          const list = lists[current].slice().concat(data)
          this.set({
            [`loading[${current}]`]: false,
            [`lists[${current}]`]: list,
            [`pageIndexes[${current}]`]: PageIndex
          })
        })
        .catch(err => {
          console.log(err)
          this.set({
            [`loading[${current}]`]: false
          })
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onReachLower() {
      const { currentIndex, finishes } = this.data
      const finished = finishes[currentIndex]
      if (!finished) {
        this.loadMore(currentIndex)
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
