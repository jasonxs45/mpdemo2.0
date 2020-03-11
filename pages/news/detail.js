import Page from '../../common/Page'
import {
  _getposter
} from '../../api/projects'
import { _newsdetail as _detail } from '../../api/news'
import {
  _like
} from '../../api/like'
import { _memberextinfo } from '../../api/member'
const app = getApp()
Page({
  data: {
    fromId: '',
    id: '',
    posterShow: false,
    content: ''
  },
  // 查询会员额外信息
  checkLike() {
    // UnionID, ObjectID, Type
    const UnionID = wx.getStorageSync('uid')
    const {
      id: ObjectID
    } = this.data
    const Type = 'News'
    _memberextinfo({
      UnionID,
      ObjectID,
      Type
    })
      .then(res => {
        const {
          code,
          msg,
          data
        } = res.data
        if (code === 0) {
          this.set({
            isLike: data.IsCollect,
            shareCount: data.ShareInfo ? data.ShareInfo.ViewCount : 0,
            poster: data.ShareInfo ? data.ShareInfo.ShareImg : ''
          })
        } else {
          this.set({
            isLike: false,
            shareCount: 0,
            poster: ''
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  like() {
    app.loading('请求中')
    const {
      id: ObjectID
    } = this.data
    const UnionID = wx.getStorageSync('uid')
    const Type = 'News'
    _like({
      UnionID,
      ObjectID,
      Type
    })
      .then(res => {
        wx.hideLoading()
        const {
          code,
          msg,
          data
        } = res.data
        if (code === 0) {
          app.toast(msg)
          this.set({
            isLike: data
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
  // 生成海报
  shareTimeline() {
    const {
      poster
    } = this.data
    if (poster) {
      this.set({
        posterShow: true
      })
    } else {
      app.loading('海报生成中')
      // UnionID, ObjectID, Type
      const UnionID = wx.getStorageSync('uid')
      const {
        id: ObjectID
      } = this.data
      const Type = 'News'
      _getposter({
        UnionID,
        ObjectID,
        Type
      })
        .then(res => {
          wx.hideLoading()
          const {
            code,
            msg,
            data
          } = res.data
          if (code === 0) {
            this.set({
              posterShow: true,
              poster: data
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
  // 保存
  saveImg() {
    const {
      poster
    } = this.data
    if (!poster) {
      return
    }
    app.loading('保存中')
    wx.downloadFile({
      url: poster,
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: result => {
            wx.hideLoading()
            this.set({
              posterShow: false
            })
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
  },
  // 关闭海报
  closePoster() {
    this.set({
      posterShow: false
    })
  },
  initQuery() {
    wx.showNavigationBarLoading()
    const { id } = this.data
    _detail(id)
      .then(res => {
        wx.hideNavigationBarLoading()
        const { code, msg, data } = res.data
        if (code != 0) {
          wx.showModal({
            title: '对不起',
            content: msg,
            showCancel: false,
            success: r => {
              if (r.confirm) {
                wx.navigateBack()
              }
            }
          })
        } else {
          this.set({
            content: data
          })
        }

      })
      .catch(err => {
        console.log(err)
        wx.hideNavigationBarLoading()
        wx.showModal({
          title: '对不起',
          content: JSON.stringify(err),
          showCancel: false
        })
      })
  },
  // 增加分享次数
  addShare() {
    const { id } = this.data
    const type = 'News'
    app.addShare({ id, type })
  },
  onLoad(options) {
    console.log(options, options.scene)
    const fromScan = options.scene
    this.data.fromScan = fromScan
    if (!fromScan) {
      const {
        id, shareunionid
      } = options
      this.set({
        id
      })
      if (shareunionid) {
        this.set({
          fromId: shareunionid
        })
        wx.setStorageSync('shareuid', shareunionid)
      }
      console.log('share', id)
    } else {
      const query = decodeURIComponent(options.scene)
      let arr = query.split(',')
      const id = arr[0]
      const fromId = arr[1]
      this.set({
        id,
        fromId
      })
      if (fromId) {
        wx.setStorageSync('shareuid', fromId)
      }
      console.log('scan', id)
    }
    this.initQuery()
    this.addShare()
  },
  onShow() {
    wx.hideHomeButton()
    app.loading('加载中')
    app.checkAuth()
      .then(res => {
        const uid = res
        return app.getUserInfoByUid(uid, true)
      })
      .then(memberInfo => {
        wx.hideLoading()
        this.checkLike()
        // if (this.data.fromId) {
        //   this.addShare()
        // }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
  },
  onShareAppMessage() {
    const { id } = this.data
    return {
      title: this.data.content.Title
    }
  }
})
