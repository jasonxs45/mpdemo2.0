import MComponent from '../../common/MComponent'
import { formatDate } from '../../utils/util'
import { _managergetlist as _list, _managerconfirm as _confirm } from '../../api/chat'
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
    showList () {
      const { list } = this.data
      return list.map(item => {
        item.date = formatDate(new Date(item.AppointTime), 'yyyy-MM-dd')
        return item
      })
    }
  },
  methods: {
    // 点击到访
    wayVisit(e) {
      wx.showModal({
        title: '温馨提示',
        content: '是否确认客户已到访？',
        success: r => {
          if (r.confirm) {
            // that.wayVisit2(e.currentTarget.dataset.id, e.currentTarget.dataset.index)
            const { id, index } = e.currentTarget.dataset
            app.loading('处理中')
            _confirm(id)
              .then(res => {
                wx.hideLoading()
                const { code, msg, data } = res.data
                if (code === 0) {
                  const { list } = this.data
                  list[index].State = '已到访'
                  this.set({
                    [`list[${index}]`]: list[index]
                  })
                  app.toast(msg)
                } else {
                  wx.showModal({
                    title: '对不起',
                    content: msg,
                    showCancel: false
                  })
                }
              })
              .catch(err => {
                console.log(err)
                wx.hideLoading()
                wx.showModal({
                  title: '对不起',
                  content: JSON.stringify(err),
                  showCancel: false
                })
              })
          }
        }
      })
    },
    wayList() {
      const member = wx.getStorageSync('member')
      const { pageIndex: PageIndex } = this.data
      const PageSize = 10
      const ConsultantID = wx.getStorageSync('member').ConsultantID
      wx.showNavigationBarLoading()
      app.loading('加载中..')
      this.set({
        loading: true
      })
      _list({ PageIndex, ConsultantID })
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
              list: data.List
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
        url: '/pages/chat/dialog?consultantID=' + data.consultantid + '&userFansID=' + data.tofansid + '&fromFansID=' + this.data.member.ID + '&toFansID=' + data.tofansid
      });
    },
    loadMore() {
      let { pageIndex: PageIndex } = this.data
      PageIndex += 1
      const ConsultantID = wx.getStorageSync('member').ConsultantID
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      _list({ PageIndex, ConsultantID })
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