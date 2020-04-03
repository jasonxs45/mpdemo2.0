import MComponent from '../../common/MComponent.js'
import {
  _housetypedetail,
  _getposter
} from '../../api/projects'
import {
  _like
} from '../../api/like'
import { _memberextinfo, _registaddpoint } from '../../api/member'
const app = getApp()
MComponent({
  data: {
    id: '',
    current: 0,
    detail: null,
    project: null,
    projcetType: null,
    list: [],
    shareCount: 0,
    isLike: false,
    likeDisable: false,
    poster: '',
    posterShow: false
  },
  computed: {
    banners () {
      const { detail } = this.data
      let arr = []
      if (detail) {
        const { ImgList, BannerList } = detail
        if (BannerList && BannerList.length) {
          arr = BannerList
        } else {
          arr = ImgList ? ImgList.slice().map(item => ({ ResourceType: "Image", Image: item })) : []
        }
      }
      return arr.map((item, index) => {
        item.sort = index
        return item
      })
    }
  },
  methods: {
    swiperChange(e) {
      const {
        current
      } = e.detail
      this.set({
        current
      })
    },
    getDetail() {
      const {
        id: ID,
        fromId: ShareUnionID
      } = this.data
      const uid = wx.getStorageSync('uid')
      const UnionID = uid ? uid : undefined
      wx.showNavigationBarLoading()
      app.loading('加载中')
      _housetypedetail({ ID, ShareUnionID, UnionID })
        .then(res => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
          const {
            code,
            msg,
            data
          } = res.data
          if (code === 0) {
            data.Project.tags = data.Project.TagList ? JSON.parse(data.Project.TagList) : []
            this.set({
              detail: data.ProjectHuXing,
              project: data.Project,
              projectType: data.ProjectType,
              list: data.ProjectHuXingList
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
          wx.hideNavigationBarLoading()
          wx.hideLoading()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    preview() {
      const {
        current: index,
        banners
      } = this.data
      const sort = banners[index].sort
      const _urls = banners.filter(item => item.ResourceType === 'Image')
      const length = _urls.length
      if (!length) {
        return
      }
      let currentIndex = _urls.findIndex(item => item.sort === sort)
      currentIndex = currentIndex === -1 ? 0 : currentIndex
      const urls = _urls.slice().map(item => item.Image)
      const current = urls[currentIndex]
      console.log(currentIndex)
      wx.previewImage({
        current,
        urls
      })
    },
    // 查询会员额外信息
    checkLike() {
      // UnionID, ObjectID, Type
      const UnionID = wx.getStorageSync('uid')
      const {
        id: ObjectID
      } = this.data
      const Type = 'HuXing'
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
              poster: data.ShareInfo ? data.ShareInfo.ShareImg : ''
            })
          } else {
            this.set({
              isLike: false,
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
      const Type = 'HuXing'
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
      if (1 === 0) {
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
        const Type = 'HuXing'
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
    // 增加分享次数
    addShare(e) {
      const { value } = e.detail
      this.set({
        member: value
      })
      const { id: ObjectID } = this.data
      const Type = 'HuXing'
      const ShareUnionID = wx.getStorageSync('shareuid')
      const UnionID = wx.getStorageSync('uid') || ''
      console.log(ShareUnionID, UnionID, ObjectID, Type)
      if (!ObjectID || !Type || !ShareUnionID) {
        return
      }
      console.log('授权后增加积分')
      _registaddpoint({ ShareUnionID, UnionID, ObjectID, Type })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    goSurround() {
      const {
        id
      } = this.data
      wx.navigateTo({
        url: `./surrounding?id=${id}`,
      })
    },
    goForm() {
      const {
        project
      } = this.data
      wx.navigateTo({
        url: `./form?id=${project.ID}`
      })
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
      this.getDetail()
      const { id } = this.data
      const type = 'HuXing'
      app.addShare({ id, type })
    },
    onShow() {
      wx.hideHomeButton()
      // app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid)
        })
        .then(memberInfo => {
          // wx.hideLoading()
          this.set({
            member: memberInfo
          })
          this.checkLike()
          // this.addShare()
        })
        .catch(err => {
          // wx.hideLoading()
          console.log(err)
        })
    },
    onShareAppMessage() {
      const { id } = this.data
      const member = wx.getStorageSync('member')
      return {
        path: member ? `/pages/projects/housetype-detail?id=${id}&shareunionid=${member.UnionID}` : `/pages/projects/housetype-detail?id=${id}`,
        title: this.data.detail.Name
      }
    }
  }
}, true)