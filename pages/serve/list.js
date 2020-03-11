import MComponent from '../../common/MComponent'
import { _usergetlist as _list } from '../../api/serve'
import { _serviceInfo } from '../../api/serve'
import { apiUrl } from '../../api/urls.js'
import { fetch, post } from '../../api/index.js'
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
    }
  },
  methods: {
    serviceInfo(e) {
      app.getReddit(tmplIds, () => {
        this.set({
          loading: true
        })
        const { index } = e.currentTarget.dataset
        const { list, member } = this.data
        const CustomerServiceID = list[index].ID
        const UnionID = member.UnionID
        this.set({
          loading: true
        })
        _serviceInfo({ CustomerServiceID, UnionID })
          .then(res => {
            wx.hideLoading()
            wx.stopPullDownRefresh()
            const { code, msg, data } = res.data
            console.log(res.data)
            if (code === 0) {
              wx.navigateTo({
                url: `/pages/serve/dialog?customerServiceID=${data.CustomerServiceInfo.ID}&userUnionID=${data.FansInfo.UnionID}&fromUnionID=${data.FansInfo.UnionID}&toUnionID=${data.CustomerServiceInfo.UnionID}`
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
      })
    },
    goChat(e) {
      const { index } = e.currentTarget.dataset
      const { list, member } = this.data
      const item = list[index]
      app.getReddit(tmplIds, () => {
        wx.navigateTo({
          url: `/pages/serve/dialog?consultantID=${item.ID}&userUnionID=${member.UnionID}&fromUnionID=${member.UnionID}&toUnionID=${item.UnionID}`
        })
      })

    },
    wayList() {
      const { pageIndex: PageIndex } = this.data
      const PageSize = 10
      const UnionID = wx.getStorageSync('uid')
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _list({ PageIndex, UnionID })
        .then(res => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
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
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    loadMore() {
      let { pageIndex: PageIndex } = this.data
      PageIndex += 1
      const UnionID = wx.getStorageSync('uid')
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _list({ PageIndex, UnionID })
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