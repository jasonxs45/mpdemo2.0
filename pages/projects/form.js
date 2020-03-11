import MComponent from '../../common/MComponent'
import { _appoint } from '../../api/projects'
import { _getPhoneNumber } from '../../api/getuserinfo'
import { _list } from '../../api/consult'
import { NAME_REG, TEL_REG } from '../../utils/reg'
const app = getApp()
import { USER_DIALOG, USER_DATE } from '../../config/tmplIds'
const tmplIds = [USER_DIALOG, USER_DATE]
const day = new Date()
day.setTime(day.getTime() + 24 * 60 * 60 * 1000)
const today = day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate()
MComponent({
  data: {
    uid: '',
    id: '',
    name: '',
    tel: '',
    date: today,
    today,
    success: false,
    result: null,
    list: [],
    consult: null,
    consultIndex: ''
  },
  computed: {
    consultInfo () {
      const { consultIndex, list } = this.data
      return list[consultIndex] ? list[consultIndex].AccountName: ''
    }
  },
  methods: {
    onInput(e) {
      const { attr } = e.currentTarget.dataset
      const { value } = e.detail
      this.data[attr] = value
    },
    onChange(e) {
      const { attr } = e.currentTarget.dataset
      const { value } = e.detail
      this.set({
        [attr]: value
      })
    },
    getList() {
      const { id } = this.data
      if (id === '') return
      app.loading('加载中')
      _list({ ProjectID: id })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              list: data
            })
            if (!this.data.list.length) {
              wx.showModal({
                title: '对不起',
                content: '该项目置业顾问暂未配置',
                showCancel: false,
                success: r => {
                  wx.navigateBack()
                }
              })
            }
          } else {
            wx.showModal({
              title: '温馨提示',
              content: msg,
              showCancel: false
            })
          }
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    goChat() {
      const { uid, result } = this.data
      app.getReddit(tmplIds, () => {
        wx.redirectTo({
          url: `/pages/chat/dialog?consultantID=${result.Consultant.ID}&userUnionID=${uid}&fromUnionID=${uid}&toUnionID=${result.Consultant.UnionID}`
        })
      })
    },
    getPhoneNumber(e) {
      const { iv, encryptedData } = e.detail
      const OpenID = wx.getStorageSync('openid')
      const UnionID = wx.getStorageSync('uid')
      if (iv && encryptedData) {
        app.loading('加载中')
        _getPhoneNumber({
          OpenID, UnionID, iv, encryptedData
        })
          .then(res => {
            wx.hideLoading()
            const { code, msg, data } = res.data
            if (code === 0) {
              this.set({
                tel: data.purePhoneNumber
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
            console.log(err)
            wx.showModal({
              title: '对不起',
              content: JSON.stringify(err),
              showCancel: false
            })
          })
      }
    },
    submit() {
      const UnionID = wx.getStorageSync('uid')
      let { id: ProjectID, name: Name, tel: Tel, date: AppointTime, list, consultIndex } = this.data
      const { select } = this.data
      let ConsultantID = ''
      if (select) {
        ConsultantID = consultIndex === '' ? '' : list.length ? list[consultIndex].ID : ''
        if (!ConsultantID) {
          app.toast('选择置业顾问')
          return
        }
      }
      AppointTime = AppointTime.replace(/\-/g, '/')
      if (!NAME_REG.test(Name)) {
        app.toast('请填写正确的中文姓名')
        return
      }
      if (!TEL_REG.test(Tel)) {
        app.toast('请先获取手机号码')
        return
      }
      if (!AppointTime) {
        app.toast('请选择预约日期')
        return
      }
      app.loading('提交中')
      _appoint({ ProjectID, UnionID, Name, Tel, AppointTime, ConsultantID })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              success: true,
              result: data
            })
          } else if (code === 2) {
            wx.showModal({
              title: '温馨提示',
              content: msg,
              showCancel: false,
              success: r => {
                if (r.confirm) {
                  console.log(2)
                  wx.redirectTo({
                    url: './appoint-record'
                  })
                }
              }
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
          console.log(err)
          wx.hideLoading()
        })
    },
    onLoad(opt) {
      const { id, select } = opt
      this.data.id = id
      if (select) {
        this.set({
          select
        })
      }
      app.loading('加载中')
      app.login()
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
          const { select } = this.data
          if (select) {
            this.getList()
          }
          if (memberInfo.FansTel) {
            this.set({
              tel: memberInfo.FansTel
            })
          }
          wx.hideLoading()
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
        })
    }
  }
}, true)