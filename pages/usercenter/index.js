import MComponent from '../../common/MComponent'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
import { _consultcode } from '../../api/member'
import { _bindJuke } from '../../api/consult'
import { _checkTrade } from '../../api/usercenter'
import { _rengouConsult, _renchouConsult } from '../../api/rengou'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      member: store => store.member,
      sysConf: store => store.sysConf
    }
  },
  data: {
    conflict: true,
    formShow: false,
    jukeCode: '',
    showIdentifyChips: false,
    showIdentifyChipsBtn: false,
    showPresale: false,
    showPresaleBtn: false,
    isRengouConsult: false,
    isRenchouConsult: false
  },
  methods: {
    showForm() {
      this.set({
        formShow: true
      })
    },
    hideForm() {
      this.set({
        formShow: false
      })
    },
    onInput(e) {
      const { value: jukeCode } = e.detail
      this.set({
        jukeCode
      })
    },
    bindJuke() {
      const member = wx.getStorageSync('member')
      const ConsultantID = member ? member.ConsultantID : ''
      if (!ConsultantID) {
        app.toast('您不是置业顾问')
        return
      }
      const { jukeCode: JuKeCode } = this.data
      if (!JuKeCode) {
        app.toast('矩客码不能为空')
        return
      }
      const UnionID = member.UnionID
      app.loading('提交中')
      _bindJuke({ UnionID, JuKeCode })
        .then(res => {
          wx.hideLoading()
          const { code, msg } = res.data
          wx.showModal({
            title: code === 0 ? '温馨提示' : '对不起',
            content: msg,
            showCancel: false,
            success: r => {
              if (r.confirm && code === 0) {
                this.hideForm()
              }
            }
          })
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
    // 是否是认购跟办顾问
    checkRengouConsult(){
      const member = wx.getStorageSync('member')
      if (member) {
        const { UnionID: fansId } = member
        _rengouConsult({ fansId })
          .then(res => {
            this.set({
              isRengouConsult: res.data.IsSuccess
            })
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    // 是否是认筹跟办顾问
    checkRenchouConsult() {
      const member = wx.getStorageSync('member')
      if (member) {
        const { UnionID: fansId } = member
        _renchouConsult({ fansId })
          .then(res => {
            this.set({
              isRenchouConsult: res.data.IsSuccess
            })
          })
          .catch(err => {
            console.log(err)
          })
      }
    },    
    onShow() {
      // app.loading('加载中')
      wx.showNavigationBarLoading()
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid)
        })
        .then(memberInfo => {
          // wx.hideLoading()
          wx.hideNavigationBarLoading()
          this.set({
            member: memberInfo
          })
          // 获取全局配置
          app.getSysConf()
            .then(res => {
              store.updateSysConf(res)
              const {
                ShowIdentifyChips,
                ShowIdentifyChipsBtn,
                ShowPresale,
                ShowPresaleBtn
              } = res
              if (ShowIdentifyChips === 'True') {
                this.checkRengouConsult()
              }
              if (ShowPresale === 'True') {
                this.checkRenchouConsult()
              }
              this.set({
                showIdentifyChips: ShowIdentifyChips === 'True',
                showIdentifyChipsBtn: ShowIdentifyChipsBtn === 'True',
                showPresale: ShowPresale === 'True',
                showPresaleBtn: ShowPresaleBtn === 'True'
              })
            })
            .catch(err => {
              console.log(JSON.stringify(err))
            })
          
        })
        .catch(err => {
          // wx.hideLoading()
          wx.hideNavigationBarLoading()
          console.log(err)
          wx.removeStorageSync('member')
          store.updateMember(null)
        })
    }
  }
}, true)