import MComponent from '../../common/MComponent'
import { _appointrecord } from '../../api/projects'
import { USER_DIALOG, USER_DATE } from '../../config/tmplIds'
const tmplIds = [USER_DIALOG, USER_DATE]
const app = getApp()
MComponent({
  data: {
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0
  },
  computed: {
    finished() {
      return this.data.list.length >= this.data.totalCount
    },
    showList () {
      return this.data.list.map(item => {
        item.coordinate = {
          latitude: item.AddressPointY,
          longitude: item.AddressPointX
        }
        return item
      })
    }
  },
  methods: {
    init() {
      this.getList()
    },
    goChat (e) {
      const { index } = e.currentTarget.dataset
      const { list, member } = this.data
      const item = list[index]
      app.getReddit(tmplIds, () => {
        wx.navigateTo({
          url: `/pages/chat/dialog?consultantID=${item.ConsultantID}&userUnionID=${member.UnionID}&fromUnionID=${member.UnionID}&toUnionID=${item.ConsultantUnionID}`
        })
      })
    },
    getList() {
      app.loading('加载中')
      const { pageIndex: PageIndex } = this.data
      const PageSize = 10
      const UnionID = wx.getStorageSync('uid')
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _appointrecord({ UnionID, PageIndex, PageSize})
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
              list: data.List,
              totalCount: data.Count
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
      let { pageIndex: PageIndex } = this.data
      const PageSize = 10
      PageIndex += 1
      const FansID = wx.getStorageSync('member').ID
      _appointrecord({ FansID, PageIndex, PageSize })
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
              totalCount: data.Count,
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
    onLoad() {
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          this.set({
            uid
          })
          return app.getUserInfoByUid(uid)
        })
        .then(memberInfo => {
          this.set({
            member: memberInfo
          })
            .then(() => {
              this.init()
            })
          wx.hideLoading()
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
        })
    },
    onPullDownRefresh() {
      this.set({
        pageIndex: 1
      })
        .then(() => {
          this.getList()
        })
    },
    onReachLower() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    }
  }
}, true)