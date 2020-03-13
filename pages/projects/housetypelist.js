import MComponent from '../../common/MComponent'
import { _housetypeist as _list } from '../../api/projects'
const app = getApp()
MComponent({
  data: {
    id: '',
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0,
    TOTAL_UNIT: app.TOTAL_UNIT,
    UNIT: app.UNIT,
  },
  computed: {
    finished() {
      return this.data.list.length >= this.data.totalCount
    },
    showList() {
      const { list } = this.data
      return list.map(item => {
        item.tags = item.TagList ? JSON.parse(item.TagList) : []
        return item
      })
    }
  },
  methods: {
    init() {
      this.getList()
    },
    getList() {
      app.loading('加载中')
      const { pageIndex: PageIndex, id: ProjectID } = this.data
      const PageSize = 10
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _list({ ProjectID, PageIndex, PageSize })
        .then(res => {
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          this.set({
            loading: false
          })
          const { code, msg, data } = res.data
          if (code != 0) {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false
            })
          } else {
            this.set({
              list: data,
              totalCount: data.Count || 0
            })
          }
        })
        .catch(err => {
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          this.set({
            loading: false
          })
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    loadMore() {
      this.set({
        loading: true
      })
      const { id: ProjectID } = this.data
      let { pageIndex: PageIndex } = this.data
      const PageSize = 5
      PageIndex += 1
      _list({ ProjectID, PageIndex, PageSize })
        .then(res => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          this.set({
            loading: false
          })
          const { code, msg, data } = res.data
          if (code != 0) {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false
            })
          } else {
            let { list } = this.data
            this.set({
              list: list.slice().concat(data.List),
              totalCount: data.Count || 0,
              pageIndex: PageIndex
            })
          }
        })
        .catch(err => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          this.set({
            loading: false
          })
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onLoad(opt) {
      this.data.id = opt.id
      this.init()
    },
    onPullDownRefresh() {
      this.set({
        pageIndex: 1
      })
        .then(() => {
          this.getList()
        })
    },
    onReachBottom() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    }
  }
}, true)