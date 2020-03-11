import MComponent from '../../common/MComponent'
import { _collectlist as _list } from '../../api/usercenter'
import { formatDate } from '../../utils/util'
const app = getApp()
MComponent({
  data: {
    currentIndex: 0,
    tabs: [
      {
        text: '项目',
        value: 'Project'
      },
      {
        text: '户型',
        value: 'HuXing'
      },
      {
        text: '新闻',
        value: 'News'
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
      return this.data.lists.map((item, index) => {
        if (index === 0) {
          item = item.map(ele => {
            ele.tags = ele.TagList ? JSON.parse(ele.TagList) : []
            return ele
          })
        }
        return item
      })
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
      this.set({
        loading: [false, false, false],
        pageIndexes: [1, 1, 1],
        lists: [[], [], []],
        totalCount: [0, 0, 0]
      }).then(() => {
        this.initQuery()
      })
    },
    initQuery() {
      const UnionID = wx.getStorageSync('uid')
      const PageSize = 10
      const { currentIndex, tabs, pageIndexes } = this.data
      const funcs = pageIndexes.map((item, index) => _list({ UnionID, Type: tabs[index].value, PageIndex: item, PageSize }))
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
      const UnionID = wx.getStorageSync('uid')
      const PageSize = 10
      this.set({
        [`loading[${current}]`]: true
      })
      _list({ UnionID, Type: tabs[current].value, PageIndex, PageSize })
        .then(res => {
          const data = res.data.data.repairList
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
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid)
        })
        .then(memberInfo => {
          wx.hideLoading()
          this.init()
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
          wx.switchTab({
            url: '/pages/projects/list'
          })
        })
    }
  }
})
