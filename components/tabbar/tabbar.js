import MComponent from '../../common/MComponent'
const list = [
  {
    text: '项目',
    iconPath: '/images/project.png',
    selectedIconPath: '/images/project.png',
    path: '/pages/projects/list'
  },
  {
    text: '首页',
    iconPath: '/images/home.png',
    selectedIconPath: '/images/home.png',
    path: '/pages/index/index'
  },
  {
    text: '我的',
    iconPath: '/images/user.png',
    selectedIconPath: '/images/user.png',
    path: '/pages/usercenter/index'
  }
]
MComponent({
  options: {
    addGlobalClass: true
  },
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    list: {
      type: Array,
      value: list
    },
    current: {
      type: Number,
      value: 0
    }
  },
  methods: {
    tabChange (e) {
      const { list } = this.data
      const { index } = e.currentTarget.dataset
      if (index === this.data.current) {
        return
      }
      wx.redirectTo({
        url: list[index].path
      })
      this.set({
        current: index
      })
      this.triggerEvent('change', { index, item: this.data.list[index] })
    }
  }
})