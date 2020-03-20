import MComponent from '../../common/MComponent'
const list = [
  {
    text: '首页',
    icon: 'index',
    iconPath: '/images/home.png',
    selectedIconPath: '/images/home.png',
    path: '/pages/index/index'
  },
  {
    text: '项目',
    icon: 'file',
    iconPath: '/images/project.png',
    selectedIconPath: '/images/project.png',
    path: '/pages/projects/list'
  },
  {
    text: '我的',
    icon: 'my',
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