import MComponent from '../../common/MComponent'
import { apiUrl } from '../../api/urls.js'
import { fetch, post } from '../../api/index.js'
import { _dialoglist, _sendmsg } from '../../api/serve'
const app = getApp()
MComponent({
  data: {
    pos: '',
    member: {},
    list: [],
    lastID: '',
    consultantID: '',
    userUnionID: '',
    fromUnionID: '',
    toUnionID: '',
    startID: '',
    endID: '',
    msg: ''
  },
  computed: {
    showList() {
      const { member, list } = this.data
      return list.map(item => {
        // console.log(member.ID === item.FromFansID)
        if (member.IsConsultant) {
          item.direction = item.ToFansID === item.UserFansID ? 'right' : 'left'
          item.avatar = item.ToFansID === item.UserFansID ? item.AccountUrl : item.FromHeadImgUrl
        } else {
          item.direction = member.ID === item.FromFansID ? 'right' : 'left'
          item.avatar = member.ID === item.FromFansID ? item.FromHeadImgUrl :  item.AccountUrl
        }
        return item
      })
    },
    lastID() {
      const { list } = this.data
      const len = list.length
      return len ? 'msg' + list[len - 1].ID : ''
    }
  },
  methods: {
    onInput(e) {
      const { value: msg } = e.detail
      this.set({
        msg
      })
    },
    registerFormSubmit(e) {
      // const { formId: form_id } = e.detail
      const { msg: Content } = this.data
      const Type = 'text'
      if (!Content.trim()) {
        app.toast('发送消息不能为空')
        return
      }
      const {
        customerServiceID: CustomerServiceID,
        userUnionID: UserUnionID,
        fromUnionID: FromUnionID,
        toUnionID: ToUnionID,
      } = this.data
      this.refreshHandler && clearInterval(this.refreshHandler)
      _sendmsg({
        CustomerServiceID,
        UserUnionID,
        FromUnionID,
        ToUnionID,
        Type,
        Content
      })
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              msg: ''
            })
            const { list } = this.data
            let startID = list.length ? list[list.length - 1].ID : ''
            console.log('startID:  ' + startID)
            let endID = ''
            this.set({
              startID,
              endID
            })
              .then(() => {
                this.wayList()
                this.refreshDialog()
              })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none', duration: 2000 })
            this.wayList()
            this.refreshDialog()
          }
        })
        .catch(err => {
          console.log(err)
          this.wayList()
          this.refreshDialog()
        })
    },
    wayList() {
      // wx.showNavigationBarLoading()
      const {
        customerServiceID: CustomerServiceID,
        userUnionID: UserUnionID,
        fromUnionID: FromUnionID,
        toUnionID: ToUnionID,
        startID: StartID,
        endID: EndID
      } = this.data
      console.log('StartID:  ' + StartID)
      // this.refreshHandler && clearInterval(this.refreshHandler)
      _dialoglist({
        CustomerServiceID,
        UserUnionID,
        FromUnionID,
        ToUnionID,
        StartID,
        EndID
      })
        .then(res => {
          wx.hideNavigationBarLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            let list = data.reverse()
            const { startID } = this.data
            if (startID !== '') {
              list = this.data.list.concat(list)
            }
            this.set({
              list,
              startID: list.length ? list[list.length - 1].ID : ''
            })
          } else {
            app.toast(msg)
            this.refreshHandler && clearInterval(this.refreshHandler)
          }
        })
        .catch(err => {
          wx.hideNavigationBarLoading()
          this.refreshHandler && clearInterval(this.refreshHandler)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    //轮询接受对话
    refreshDialog() {
      this.refreshHandler = setInterval(() => {
        const { list } = this.data
        this.wayList()
      }, 3000)
    },
    wayImg() {
      wx.showModal({
        title: '温馨提示',
        content: '开发中',
        showCancel: false
      })
    },
    onLoad(options) {
      const { customerServiceID, userUnionID, fromUnionID, toUnionID } = options
      console.log(options)
      this.data.customerServiceID = customerServiceID
      this.data.userUnionID = userUnionID
      this.data.fromUnionID = fromUnionID
      this.data.toUnionID = toUnionID
      app.checkAuth()
        .then(res => {
          const uid = res
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
    onShow() {
      this.refreshDialog()
    },
    onHide() { 
      this.refreshHandler && clearInterval(this.refreshHandler)
    },
    onUnload() {
      this.refreshHandler && clearInterval(this.refreshHandler)
    },
    onPullDownRefresh() { },
    onReachBottom() { },
    onShareAppMessage: null
  }
}, true)