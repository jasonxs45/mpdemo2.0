import MComponent from '../../common/MComponent'
import { _list, _category } from '../../api/news'
import { formatDate } from '../../utils/util'
const app = getApp()
MComponent({
  data: {
    type: '',
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
    onChange(e) {
      const { value, current } = e.detail
      this.set({
        currentIndex: current === undefined ? value : current
      })
    },
    init() {
      const { type } = this.data
      app.loading('加载中')
      _category()
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
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
            let currentIndex = tabs.findIndex(item => item.text === type)
            currentIndex = currentIndex === -1 ? 0 : currentIndex
            this.set({
              tabs,
              loading,
              pageIndexes,
              lists,
              totalCount,
              currentIndex
            })
              .then(() => {
                this.initQuery()
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
          wx.hideLoading()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    initQuery() {
      const PageSize = 10
      const { currentIndex, tabs, pageIndexes } = this.data
      const funcs = pageIndexes.map((item, index) => _list({ Type: tabs[index].value, PageIndex: item, PageSize }))
      this.set({
        [`loading[${currentIndex}]`]: true
      })
      Promise.all(funcs)
        .then(res => {
          console.log(res)
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
      _list({ Type: tabs[current].value, PageIndex, PageSize })
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
    onLoad(opt) {
      let { type } = opt
      this.data.type = type ? decodeURIComponent(type) : ''
      this.init()
    }
  }
}, true)
