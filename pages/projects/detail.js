import MComponent from '../../common/MComponent'
import {
  _detail,
  _getposter,
  _addshare,
  _checkConsult
} from '../../api/projects'
import { _list, _dispatch } from '../../api/consult'
import { _like } from '../../api/like'
import { _memberextinfo, _registaddpoint } from '../../api/member'
const app = getApp()
import { USER_DIALOG, USER_DATE } from '../../config/tmplIds'
const tmplIds = [USER_DIALOG, USER_DATE]
MComponent({
  data: {
    cate: {
      '交通': '/images/trafic.png',
      '学校': '/images/school.png',
      '商业': '/images/comercial.png',
      '医疗': '/images/medical.png',
      '旅游': '/images/trip.png'
    },
    id: '',
    swiperIndex: 0,
    detail: null,
    houseTypeIndex: 0,
    setting: {
      enableScroll: false,
      enableRotate: false,
      enableZoom: false
    },
    markers: [],
    shareCount: 0,
    isLike: false,
    likeDisable: false,
    poster: '',
    posterShow: false,
    news: [],
    goods: [],
    TOTAL_UNIT: app.TOTAL_UNIT,
    UNIT: app.UNIT,
    alreadyBinded: '',
    backShow: true,
    list: [],
    myConsult: null
  },
  computed: {
    project() {
      const {
        detail
      } = this.data
      let obj = detail ? detail.Project : {}
      obj.tags = obj.TagList ? JSON.parse(obj.TagList) : []
      obj.pcoordinate = {
        latitude: obj.AddressPointY,
        longitude: obj.AddressPointX
      }
      obj.scoordinate = {
        latitude: obj.SalePointY,
        longitude: obj.SalePointX
      }
      return obj
    },
    panos() {
      const {
        detail
      } = this.data
      let arr = []
      if (detail) {
        const panos = detail.Project.VRList
        arr = panos
      }
      return arr
    },
    relations() {
      const {
        detail
      } = this.data
      let obj = detail ? detail.RelatedProject.List : []
      return obj.map(item => {
        item.tags = item.TagList ? JSON.parse(item.TagList) : []
        return item
      })
    },
    swipers() {
      const {
        detail
      } = this.data
      let arr = []
      if (detail) {
        const {
          Project
        } = detail
        const { BannerList, ImgList1 } = Project
        arr = BannerList.length ? BannerList : ImgList1.map(item => ({ Image: item }))
      }
      return arr
    },
    projectTypeImgs() {
      const {
        detail
      } = this.data
      let obj = detail ? detail.ProjectType.filter(item => item.ProjectHuXing.length) : []
      return obj
    },
    albums() {
      const {
        detail
      } = this.data
      let arr = []
      if (detail) {
        const {
          Project
        } = detail
        const {
          ImgGroup
        } = Project
        arr = ImgGroup.filter(item => Project[item.Field] && Project[item.Field].length > 0).map(item => ({
          title: item.Text,
          img: Project[item.Field][0],
          length: Project[item.Field].length
        }))
      }
      return arr
    },
    surrounding() {
      const {
        detail
      } = this.data
      let obj = detail ? detail.ProjectSupport : []
      return obj
    }
  },
  methods: {
    swiperChange(e) {
      const {
        current: value
      } = e.detail
      this.set({
        swiperIndex: value
      })
    },
    onTabTap(e) {
      const {
        index: houseTypeIndex
      } = e.currentTarget.dataset
      this.set({
        houseTypeIndex
      })
    },
    // 获取详情
    getDetail() {
      const { id: ID } = this.data
      const member = wx.getStorageSync('member')
      const UnionID = member ? member.UnionID : ''
      wx.showNavigationBarLoading()
      app.loading('数据加载中')
      _detail({ UnionID, ID })
        .then(res => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
          const {
            code,
            msg,
            data
          } = res.data
          if (code === 0) {
            data.HeadImgUrlList = data.HeadImgUrlList.slice(0, 14)
            data.ProjectHuXing = data.ProjectHuXing.slice(0, 2)
            this.set({
              detail: data,
              news: data.NewsList,
              goods: data.GoodsList.slice(0, 2),
              markers: [{
                latitude: data.Project.AddressPointY,
                longitude: data.Project.AddressPointX
              }]
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
    // 查询是否绑定过置业顾问
    checkConsult() {
      // UnionID, ProjectID
      const UnionID = wx.getStorageSync('uid')
      const {
        id: ProjectID
      } = this.data
      return _checkConsult({
        UnionID,
        ProjectID
      })
      // .then(res => {
      //   const {
      //     code,
      //     msg,
      //     data
      //   } = res.data
      //   if (code === 0) {
      //     this.set({
      //       alreadyBinded: data.IsBindFriendOnProject
      //     })
      //   } else {
      //     console.log(msg)
      //   }
      // })
      // .catch(err => {
      //   console.log(err)
      // })
    },
    // 查询会员额外信息
    checkLike() {
      // UnionID, ObjectID, Type
      const UnionID = wx.getStorageSync('uid')
      const {
        id: ObjectID
      } = this.data
      const Type = 'Project'
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
      const Type = 'Project'
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
        const Type = 'Project'
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
      const Type = 'Project'
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
    // 预约
    _goForm(alreadyBinded) {
      const { id, detail } = this.data
      if (detail) {
        const { AssignConsultantType } = detail.Project
        if (AssignConsultantType === 'System') {
          console.log('系统分配置业顾问')
          wx.navigateTo({
            url: `./form?id=${id}`
          })
        } else {
          if (alreadyBinded) {
            console.log('用户自选置业顾问，但是已经绑定了')
            wx.navigateTo({
              url: `./form?id=${id}`
            })
          } else {
            console.log('用户自选置业顾问')
            wx.navigateTo({
              url: `./form?id=${id}&select=true`
            })
          }
        }
      }
    },
    goForm() {
      app.getReddit(tmplIds, () => {
        app.loading('加载中')
        this.checkConsult()
          .then(res => {
            wx.hideLoading()
            const {
              code,
              msg,
              data
            } = res.data
            if (code === 0) {
              const alreadyBinded = data.IsBindFriendOnProject
              this._goForm(alreadyBinded)
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
            wx.showModal({
              title: '对不起',
              content: JSON.stringify(err),
              showCancel: false
            })
          })
      })
    },
    // 获取置业顾问列表
    getList() {
      const { id } = this.data
      if (id === '') return
      app.loading('加载中')
      _list({ ProjectID: id })
        .then(res => {
          wx.hideLoading()
          console.log(res)
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              list: data.slice(0, 5)
            })
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
    // 绑定置业顾问
    bindConsult(e) {
      const { index } = e.currentTarget.dataset
      const { list, member, id } = this.data
      const consultInfo = list[index]
      if (consultInfo) {
        wx.showModal({
          title: '温馨提示',
          content: '每个楼盘仅可绑定一位置业顾问，请确认您的选择！',
          success: r => {
            if (r.confirm) {
              const UnionID = member.UnionID
              const ProjectID = id
              const ConsultantID = consultInfo.ID
              app.loading('加载中')
              _dispatch({ UnionID, ProjectID, ConsultantID })
                .then(res => {
                  wx.hideLoading()
                  const { code, msg, data } = res.data
                  if (code === 0) {
                    wx.redirectTo({
                      url: `/pages/consult/index?consultid=${ConsultantID}`
                    })
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
                  wx.showModal({
                    title: '对不起',
                    content: JSON.stringify(err),
                    showCancel: false
                  })
                })
            }
          }
        })
      }
    },
    // 查询我绑定的置业顾问
    getMyConsult() {
      this.checkConsult()
        .then(res => {
          console.log(res)
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              myConsult: data.IsBindFriendOnProject ? data.Consultant : null
            })
          }
        })
        .catch(err => {
          console.log(err)
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
      this.getList()
      // 分享相关
      const { id } = this.data
      const type = 'Project'
      app.addShare({ id, type })
    },
    onShow() {
      wx.hideHomeButton()
      if (getCurrentPages().length < 2) {
        this.set({
          backShow: false
        })
      }
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          // wx.hideLoading()
          this.set({
            member: memberInfo
          })
          this.checkLike()
          this.getMyConsult()
          // if (this.data.fromId) {
          //   this.addShare()
          // }
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
        path: member ? `/pages/projects/detail?id=${id}&shareunionid=${member.UnionID}` : `/pages/projects/detail?id=${id}`,
        title: this.data.project.ProjectName
      }
    }
  }
}, true)