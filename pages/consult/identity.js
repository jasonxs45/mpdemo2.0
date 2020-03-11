import MComponent from '../../common/MComponent'
import { _indentity, _scan } from '../../api/consult'
import { _consultcode } from '../../api/member'
import { _getPhoneNumber } from '../../api/getuserinfo'
import { USER_DIALOG, USER_DATE } from '../../config/tmplIds'
const tmplIds = [USER_DIALOG, USER_DATE]
const app = getApp()
MComponent({
  data: {
    id: '',
    consultInfo: null,
    imgs: [],
    showImgs: [],
    words: '',
    qrShow: false
  },
  computed: {
    isMine() {
      let res = false
      const member = wx.getStorageSync('member')
      const mUid = member ? member.UnionID : ''
      const { consultInfo } = this.data
      const cUid = consultInfo ? consultInfo.UnionID : ''
      if (mUid && cUid) {
        res = mUid === cUid
      }
      return res
    }
  },
  methods: {
    goChat() {
      const member = wx.getStorageSync('member')
      const { consultInfo } = this.data
      if (member) {
        app.getReddit(tmplIds, () => {
          wx.navigateTo({
            url: `/pages/chat/dialog?consultantID=${consultInfo.ID}&userUnionID=${member.UnionID}&fromUnionID=${member.UnionID}&toUnionID=${consultInfo.UnionID}`
          })
        })
      }
    },
    showCode() {
      const member = wx.getStorageSync('member')
      const { id: ConsultantID, consultInfo } = this.data
      app.loading('加载中')
      _consultcode({ ConsultantID })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              ['consultInfo.QRcode']: data,
              qrShow: true
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
        })
    },
    hideCode() {
      this.set({
        qrShow: false
      })
    },
    // 保存
    saveImg() {
      const { consultInfo } = this.data
      if (consultInfo && consultInfo.QRcode) {
        app.loading('保存中')
        wx.downloadFile({
          url: consultInfo.QRcode,
          success: res => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: result => {
                wx.hideLoading()
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                })
              },
              fail: () => {
                wx.hideLoading()
                wx.showToast({
                  title: '图片下载失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({
              title: '图片下载失败',
              icon: 'none'
            })
          }
        })
      }
    },
    getConsult() {
      const { id: ConsultantID } = this.data
      app.loading('加载中')
      _indentity({ ConsultantID })
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          console.log(res)
          if (code === 0) {
            this.set({
              consultInfo: data.Consultant,
              imgs: data.HeadImgUrlList,
              showImgs: data.HeadImgUrlList.slice(0, 8),
              projects: data.Project.List,
              words: data.Consultant.Instruction || ''
            })
          } else {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false,
              success: r => {
                if (r.confirm) {
                }
              }
            })
          }
        })
        .catch(err => {
          wx.hideLoading()
          console.log(err)
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false,
            success: r => {
              if (r.confirm) {
              }
            }
          })
        })
    },
    bindConsult() {
      const member = wx.getStorageSync('member')
      if (member) {
        const UnionID = member.UnionID
        const { id: ConsultantID } = this.data
        app.loading('加载中')
        _scan({ UnionID, ConsultantID })
          .then(res => {
            wx.hideLoading()
            const { code, msg, data } = res.data
            console.log(res)
            if (code === 0) {
              console.log(msg)
            } else {
              app.toast(msg)
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
    onAuth(e) {
      const { value } = e.detail
      wx.setStorageSync('member', value)
      this.set({
        member: value
      })
        .then(() => {
          this.bindConsult()
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
                .then(() => {
                  const { consultInfo } = this.data
                  const uid = wx.getStorageSync('uid')
                  wx.redirectTo({
                    url: `/pages/chat/dialog?consultantID=${consultInfo.ID}&userUnionID=${uid}&fromUnionID=${uid}&toUnionID=${consultInfo.UnionID}`
                  })
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
    onLoad(options) {
      const fromScan = options.scene
      this.data.fromScan = fromScan
      if (!fromScan) {
        const { id } = options
        if (id) {
          console.log('用户自己转发')
        }
        this.set({
          id: id || ''
        })
      } else {
        console.log('扫码进入')
        const query = decodeURIComponent(options.scene)
        let arr = query.split('&')
        arr = arr.map(item => item.split('='))
        let obj = {}
        for (let i = 0, len = arr.length; i < len; i++) {
          obj[arr[i][0]] = obj[arr[i][0]] || arr[i][1]
        }
        const { ConsultantID: id } = obj
        this.set({
          id
        })
      }
      this.getConsult()
      this.bindConsult()
    },
    onShow() {
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          this.set({
            member: memberInfo
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    onShareAppMessage() {
      const { consultInfo } = this.data
      const title = consultInfo ? `您好，我是${consultInfo.AccountName}，这是我的名片` : ''
      return {
        title,
        path: `/pages/consult/identity?id=${this.data.id}`,
        imageUrl: consultInfo.AccountUrl
      }
    }
  }
}, true)