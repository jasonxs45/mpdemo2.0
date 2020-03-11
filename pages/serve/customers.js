import MComponent from '../../common/MComponent'
import { formatDate } from '../../utils/util'
import { _customerslist as _list } from '../../api/serve'
const app = getApp()
MComponent({
  data: {
    member: {},
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0
  },
  computed: {
    finished() {
      return this.data.list.length >= this.data.totalCount
    },
    showList() {
      const { list } = this.data
      return list.map(item => {
        item.date = formatDate(new Date(item.AppointTime), 'yyyy-MM-dd')
        return item
      })
    }
  },
  methods: {
    wayList() {
      const member = wx.getStorageSync('member')
      const { pageIndex: PageIndex } = this.data
      const PageSize = 10
      const CustomerServiceID = wx.getStorageSync('member').CustomerServiceID
      wx.showNavigationBarLoading()
      app.loading('加载中..')
      this.set({
        loading: true
      })
      _list({ PageIndex, CustomerServiceID })
        .then(res => {
          this.set({
            loading: false
          })
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              list: data
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
          this.set({
            loading: false
          })
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    //聊天按钮
    mes_btn(e) {
      var data = e.currentTarget.dataset
      console.log(data)
      wx.navigateTo({
        url: '/pages/serve/dialog?customerServiceID=' + data.CustomerServiceID + '&userFansID=' + data.tofansid + '&fromFansID=' + this.data.member.ID + '&toFansID=' + data.tofansid
      });
    },
    loadMore() {
      let { pageIndex: PageIndex } = this.data
      PageIndex += 1
      const CustomerServiceID = wx.getStorageSync('member').CustomerServiceID
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _list({ PageIndex, CustomerServiceID })
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
              list: list.slice().concat(data),
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
          }).then(() => {
            this.wayList()
          })
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
          wx.switchTab({
            url: '/pages/projects/list'
          })
        })
    },
    onPullDownRefresh() {
      this.set({
        pageIndex: 1
      })
        .then(() => {
          this.wayList()
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