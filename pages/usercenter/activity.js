import MComponent from '../../common/MComponent'
import { _mylist } from '../../api/activity'
import { formatDate } from '../../utils/util'
const app = getApp()
MComponent({
  data: {
    loading: false,
    list: [],
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
    init() {
      this.set({
        pageIndex: 1,
        loading: false,
        finished: true
      })
        .then(() => {
          this.initQuery()
        })
    },
    initQuery() {
      const PageSize = 10
      const { pageIndex: PageIndex } = this.data
      const UnionID = wx.getStorageSync('uid')
      this.set({
        loading: true
      })
      _mylist({ UnionID, PageIndex, PageSize })
        .then(res => {
          wx.hideLoading()
          wx.stopPullDownRefresh()
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
      const { pageIndex, list } = this.data
      const UnionID = wx.getStorageSync('uid')
      let PageIndex = pageIndex + 1
      const PageSize = 10
      this.set({
        loading: true
      })
      _mylist({ UnionID, PageIndex, PageSize })
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
    onReachBottom() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    },
    onPullDownRefresh () {
      this.init()
    },
    onLoad() {
      this.init()
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
