import MComponent from '../../common/MComponent'
import { _bind } from '../../api/usercenter'
import { NAME_REG } from '../../utils/reg'
const app = getApp()
MComponent({
  data: {
    name: '',
    idcard: ''
  },
  methods: {
    onInput(e) {
      const { attr } = e.currentTarget.dataset
      const { value } = e.detail
      this.set({
        [attr]: value
      })
    },
    submit() {
      const UnionID = wx.getStorageSync('uid')
      // UnionID, Name, IDCard
      let { name: Name, idcard: IDCard } = this.data
      if (!NAME_REG.test(Name)) {
        app.toast('请填写正确的中文姓名')
        return
      }
      if (!IDCard.trim()) {
        app.toast('请填写身份证后6位')
        return
      }
      IDCard = IDCard.toUpperCase()
      if (!(/\b\d{5}(\d|X){1}\b/g).test(IDCard)) {
        app.toast('请正确填写身份证后6位')
        return
      }
      app.loading('提交中')
      _bind({ UnionID, Name, IDCard })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          wx.showModal({
            title: code === 0 ? '温馨提示' : '对不起',
            content: msg,
            showCancel: false,
            success: r => {
              if (r.confirm) {
                if (code === 0) {
                  wx.switchTab({
                    url: '/pages/usercenter/index'
                  })
                }
              }
            }
          })
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
        })
    },
    onLoad(opt) {
      const { id } = opt
      this.data.id = id
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