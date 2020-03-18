import MComponent from '../../common/MComponent'
import { _mylist as _list } from '../../api/goods'
const app = getApp()
MComponent({
  data: {
    name: '',
    currentIndex: 0,
    tabs: [
      {
        text: '已兑换',
        value: '已购买'
      },
      {
        text: '已核销',
        value: '已核销'
      }
    ],
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
      return this.data.lists
    }
  },
  methods: {
    onChange(e) {
      const { value, current } = e.detail
      this.set({
        currentIndex: current === undefined ? value : current
      })
    },
    init() {
      const { tabs } = this.data
      let loading = [],
        pageIndexes = [],
        lists = [],
        totalCount = []
      for (let i = 0; i < tabs.length; i++) {
        loading.push(false)
        pageIndexes.push(1)
        lists.push([])
        totalCount.push(0)
      }
      this.set({
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
      const PageSize = 10
      const { currentIndex, tabs, pageIndexes } = this.data
      const UnionID = wx.getStorageSync('uid')
      const funcs = pageIndexes.map((item, index) => _list({ UnionID, State: tabs[index].value, PageIndex: item, PageSize }))
      this.set({
        [`loading[${currentIndex}]`]: true
      })
      Promise.all(funcs)
        .then(res => {
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
      this.set({
        [`loading[${current}]`]: true
      })
      const UnionID = wx.getStorageSync('uid')
      _list({ UnionID, State: tabs[current].value, PageIndex, PageSize })
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
    onShow() {
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          wx.hideLoading()
          this.set({
            member: memberInfo
          }).then(() => {
            this.init()
          })
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
    }
  }
}, true)