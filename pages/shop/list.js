import MComponent from '../../common/MComponent'
import { _bg, _list } from '../../api/goods'
import { _projectlist } from '../../api/projects'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      city: store => store.city
    }
  },
  data: {
    bg: '',
    fixed: false,
    rect: null,
    topHeight: '',
    fixedTop: 0,
    paddingBottom: '',
    name: '',
    projects: [],
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0,
    current: 0
  },
  computed: {
    finished() {
      return this.data.list.length >= this.data.totalCount
    },
    showList() {
      const { list } = this.data
      return list.map(item => {
        item.tags = item.TagList ? JSON.parse(item.TagList) : []
        return item
      })
    }
  },
  methods: {
    // 获取顶部浮动数据
    calcRect () {
      wx.createSelectorQuery().select('#cover').boundingClientRect(rect1 => {
        wx.createSelectorQuery().select('#top').boundingClientRect(rect2 => {
          this.set({
            topHeight: rect2.top - rect1.top,
            paddingBottom: rect2.bottom + 'px'
          })
        }).exec()
      }).exec()
    },
    onInit (e) {
      this.data.city = e.detail.value
      this.init()
    },
    getBg () {
      _bg()
        .then(res => {
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              // bg: data.Image
              bg: ''
            })
            this.calcRect()
          }
        })
        .catch(err => {
          console.log(err)
          this.calcRect()
        })
    },
    // 输入框
    onInput(e) {
      const { value } = e.detail
      this.data.name = value
      if (value === '') {
        this.getList()
      }
    },
    onChange(e) {
      const { projects } = this.data
      const { value } = e.detail
      this.set({
        current: value,
        name: projects[value].ProjectName === '全部' ? '' : projects[value].ProjectName
      })
        .then(() => {
          this.getList()
        })
    },
    init() {
      this.set({
        name: this.data.name || '',
        projects: [],
        list: [],
        loading: false,
        pageIndex: 1,
        totalCount: 0,
        current: 0
      })
      this.getProjectList()
    },
    getProjectList() {
      const { name } = this.data
      const { city } = this.data
      const CityID = city.ID ? [city.ID] : []
      app.loading('加载中')
      const PageSize = 100
      _projectlist({ CityID, PageIndex: 1, PageSize: 100})
        .then(res => {
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code != 0) {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false
            })
          } else {       
            data.List.unshift({
              ProjectName: '全部'
            })
            if (name) {
              let index = data.List.findIndex(item => item.ProjectName.includes(name))
              if (index !== -1) {
                const list = data.List
                this.set({
                  name: list[index].ProjectName === '全部' ? '' : list[index].ProjectName,
                  current: index
                })
              } else {
                this.set({
                  name: ''
                })
              }
            }
            this.set({
              projects: data.List
            })
            this.getList()
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
    getList() {
      const { city } = this.data
      const CityID = city ? city.ID : ''
      app.loading('加载中')
      const { pageIndex: PageIndex } = this.data
      const PageSize = 10
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      const { name: KeyWord } = this.data
      _list({ CityID, KeyWord, PageIndex, PageSize })
        .then(res => {
          wx.hideLoading()
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
            this.set({
              list: data.List,
              totalCount: data.Count
            })
          }
        })
        .catch(err => {
          wx.hideLoading()
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
    loadMore() {
      this.set({
        loading: true
      })
      let { pageIndex: PageIndex } = this.data
      const PageSize = 10
      PageIndex += 1
      const { name: KeyWord } = this.data
      const { city } = this.data
      const CityID = city ? city.ID : ''
      _list({ CityID, KeyWord, PageIndex, PageSize })
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
    onLoad(options) {
      this.getBg()
      const { name } = options
      if (name) {
        this.set({
          name
        })
      }
    },
    onReady () {
      this.calcRect()
      this.set({
        rect: wx.getMenuButtonBoundingClientRect()
      })
    },
    onShow() {
      app.loading('加载中')
      app.checkAuth()
        .then(res => {
          const uid = res
          return app.getUserInfoByUid(uid, true)
        })
        .then(memberInfo => {
          wx.hideLoading()
          if (this.data.city) {
            this.init()
          }
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
    },
    onPageScroll(e) {
      const { rect, topHeight, fixed, fixedTop } = this.data
      if (e.scrollTop >= topHeight - rect.bottom - 10) {
        this.data.fixed = true
        this.data.fixedTop = -(topHeight - rect.bottom - 10)
      } else {
        this.data.fixed = false
        this.data.fixedTop = ''
      }
      // 避免频繁调用setData，只在关键变量发生变化后调用
      if (fixed !== this.data.fixed) {
        this.set({
          fixed: this.data.fixed,
          fixedTop: this.data.fixedTop
        })
      }
    },
    onPullDownRefresh() {
      this.set({
        pageIndex: 1
      })
        .then(() => {
          this.getList()
        })
    },
    onReachLower() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    }
  }
}, true)