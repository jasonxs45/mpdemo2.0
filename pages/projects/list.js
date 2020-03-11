import MComponent from '../../common/MComponent'
import { _arealist, _filterlist, _projectlist } from '../../api/projects'
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../store/index'
const app = getApp()
MComponent({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: {
      keyword: store => store.keyword,
      city: store => store.city
    }
  },
  data: {
    rect: null,
    topHeight: 0,
    fixed: false,
    fixedTop: '',
    filterList: [
      { name: '区域', group: 'areaList' },
      { name: '类型', group: 'typeList' },
      { name: '价位', group: 'priceList' },
      { name: '其他', group: 'tagList' }
    ],
    filterOpts: [[], [], [], []],
    filterIndex: null,
    filterShow: false,
    selectedValues: [[], [], [], []],
    list: [],
    loading: false,
    pageIndex: 1,
    totalCount: 0
  },
  computed: {
    shortFakeHeight () {
      return this.data.rect ? (this.data.rect.bottom + 10) + 'px': ''
    },
    finished() {
      return this.data.list.length >= this.data.totalCount
    },
    showList () {
      const { list } = this.data
      return list.map(item => {
        item.tags = item.TagList ? JSON.parse(item.TagList) : []
        return item
      })
    },
    briefShow () {
      const { selectedValues } = this.data
      return selectedValues.some(item => item.length > 0)
    },
    briefStr () {
      const { selectedValues } = this.data
      return selectedValues.map(item => item.map(ele => ele.Name).join(',')).filter(item => item).join('|')
    }
  },
  methods: {
    // 阻止滚动
    stop () {},
    // 筛选区域
    closeFilter() {
      let { selectedValues, filterIndex: index, filterOpts } = this.data
      let values = selectedValues.map(item => item.map(item => item.Value))
      let arr = filterOpts.map((item, index) => {
        if (values[index].length === 0) {
          item = item.map(ele => {
            ele.checked = false
            return ele
          })
          item[0].checked = true
        } else {
          item.map((ele, idx) => {
            ele.checked = values[index].includes(ele.Value)
            return ele
          })
        }
        return item
      })
      this.set({
        filterOpts: arr
      })
        .then(() => {
          this.set({
            filterShow: false,
            filterIndex: null
          })
        })
    },
    reset() {
      const { filterOpts, selectedValues } = this.data
      let arr = filterOpts.map(item => {
        item.map((item, idx) => {
          item.checked = idx === 0 ? true : false
          return item
        })
        return item
      })
      return this.set({
        filterOpts: arr
      })
    },
    filterTap(e) {
      const { rect, topHeight, filterList, filterIndex } = this.data
      const { index } = e.currentTarget.dataset
      if (index === filterIndex) {
        this.set({
          filterShow: false,
          filterIndex: null
        })
      } else {
        this.set({
          filterIndex: index,
          filterShow: true
        })
          .then(() => {
            const { fixed } = this.data
            if (!fixed) {
              wx.pageScrollTo({
                scrollTop: (topHeight - rect.bottom - 10),
                duration: 0
              })
            }
          })
      }
    },
    onCheckTap(e) {
      const { index, value } = e.currentTarget.dataset
      const { filterOpts } = this.data
      let arr = filterOpts.slice()
      if (value === 0) {
        if (filterOpts[index][0].checked) {
          return
        }
        arr = filterOpts[index].map((item, idx) => {
          item.checked = idx === 0 ? true : false
          return item
        })
      } else {
        arr = filterOpts[index].map((item, idx) => {
          item.checked = idx === 0 ? false : idx === value ? !item.checked : item.checked
          return item
        })
        if (arr.every(item => !item.checked)) {
          arr[0].checked = true
        }
      }
      this.set({
        [`filterOpts[${index}]`]: arr
      })
    },
    confirm() {
      let { filterIndex: index, filterOpts, selectedValues } = this.data
      selectedValues = filterOpts.map(item => item.filter(ele => ele.checked && ele.Value !== ''))
      this.set({
        selectedValues
      }).then(res => {
        this.set({
          filterShow: false,
          filterIndex: null
        })
        this.data.pageIndex = 1
        this.getList()
      })
    },
    clear () {
      this.reset()
        .then(() => {
          this.set({
            selectedValues: [[], [], [], []]
          })
            .then(() => {
              this.data.pageIndex = 1
              this.getList()
            })
        })
    },
    // 顶部定位组件
    onInit (e) {
      this.data.city = e.detail.value
      this.init()
    },
    init() {
      const { city } = this.data
      if (city) {
        app.loading('加载中')
        this.set({
          selectedValues: [[], [], [], []],
          pageIndex: 1
        })
        _filterlist(city.ID)
          .then(res => {
            const { code, msg, data } = res.data
            if (code === 0) {
              let { AreaList, ProjectTypeList, TagList, TotalPriceList } = data
              const areaList = AreaList.map(item => {
                item.Value = item.ID
                return item
              }),
                typeList = Object.entries(ProjectTypeList).map(item => ({ Name: item[0], Value: item[1] })),
                tagList = Object.entries(TagList).map(item => ({ Name: item[0], Value: item[1] })),
                priceList = Object.entries(TotalPriceList).map(item => ({ Name: item[0], Value: item[1] }))
              let filterOpts = [areaList, typeList, priceList, tagList]
              filterOpts = filterOpts.slice().map(item => {
                item.unshift({
                  Name: '全部',
                  Value: '',
                  checked: true
                })
                return item
              })
              this.set({
                filterOpts
              })
              this.getList()
            } else {
              wx.showModal({
                title: '温馨提示',
                content: msg,
                showCancel: false
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    getList() {
      app.loading('加载中')
      const { pageIndex: PageIndex, city } = this.data
      const PageSize = 10
      wx.showNavigationBarLoading()
      this.set({
        loading: true
      })
      let [AreaID, ProjectTypeList, TotalPrice, TagList] = this.data.selectedValues
      AreaID = AreaID.map(item => item.Value)
      ProjectTypeList = ProjectTypeList.map(item => item.Value)
      TotalPrice = TotalPrice.map(item => item.Value)
      TagList = TagList.map(item => item.Value)
      const keyword = store.keyword
      const ProjectName = [keyword]
      const CityID = city.ID ? [city.ID] : []
      _projectlist({ CityID, PageIndex, PageSize, ProjectName, AreaID, ProjectTypeList, TotalPrice, TagList, PageSize: 5 })
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
      // 缓存全局keyword
      if (keyword) {
        let arr = wx.getStorageSync('latest_keywords') || []
        if (arr.includes(keyword)) {
          return
        }
        if (arr.length >= 3) {
          arr.shift()
        }
        arr.push(keyword)
        wx.setStorageSync('latest_keywords', arr)
      }
    },
    loadMore() {
      this.set({
        loading: true
      })
      let [AreaID, ProjectTypeList, TotalPrice, TagList] = this.data.selectedValues
      AreaID = AreaID.map(item => item.Value)
      ProjectTypeList = ProjectTypeList.map(item => item.Value)
      TotalPrice = TotalPrice.map(item => item.Value)
      TagList = TagList.map(item => item.Value)
      const { name } = this.data
      const ProjectName = [name]
      let { pageIndex: PageIndex } = this.data
      const PageSize = 5
      PageIndex += 1
      const { city } = this.data
      const CityID = city.ID ? [city.ID] : []
      _projectlist({ CityID, PageIndex, PageSize, ProjectName, AreaID, ProjectTypeList, TotalPrice, TagList })
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
    onReady () {
      wx.createSelectorQuery().select('#top').boundingClientRect(rect => {
        this.set({
          topHeight: rect.top
        })
      }).exec()
      this.set({
        rect: wx.getMenuButtonBoundingClientRect()
      })
    },
    onShow() {
      this.data.city = store.city
      this.init()
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
        console.log(1)
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
    onReachBottom() {
      const { finished } = this.data
      if (!finished) {
        this.loadMore()
      }
    }
  }
}, true)