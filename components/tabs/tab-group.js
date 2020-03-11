import MComponent from '../../common/MComponent'
const DESCENDANT_PATH = './tab-item'
MComponent({
  relations: {
    [DESCENDANT_PATH]: {
      type: 'descendant',
      linked(target) {
        this.child.push(target)
      },
      unlinked(target) {
        this.child = this.child.filter(item => item !== target)
      }
    }
  },
  properties: {
    current: {
      type: Number,
      value: 0,
      observer: 'updateCurrent'
    },
    line: {
      type: Boolean,
      value: false
    },
    barStyle:String
  },
  data: {
    lineStyle: '',
    scroll: false,
    scrollLeft: 0
  },
  methods: {
    updateCurrent (val) {
      if (val >= this.child.length || !this.child.length) {
        return
      }
      this.child.forEach((item, index) => {
        item.set({
          active: index === val
        })
      })
      this.setLineStyle(val)
    },
    setLineStyle (index) {
      const { line, scroll } = this.data
      if (!line) {
        return
      }
      if (index >= this.child.length) {
        return
      }
      if (scroll) {
        let stack = []
        this.child.forEach(item => {
          stack.push(item.getRect('.tab-item'))
        })
        Promise.all([
          this.getRect('.tab-group-wrapper'),
          Promise.all(stack)
        ]).then(([navRect, _tabs]) => {
          const _leftWidth = _tabs.slice(0, index,).reduce((prev, curr) => prev += curr.width, 0)
          const _tab = _tabs[index]
          // 计算scroll-view的left滚动值
          const _scrollLeft = _leftWidth - (navRect.width - _tab.width) * .5
          // 计算横线的位置
          const _lineLeft = _leftWidth + _tab.width * .25
          this.set({
            scrollLeft: _scrollLeft,
            lineStyle: `width:${_tab.width * .5}px;transform: translateX(${_lineLeft}px);`
          })
        })
      } else {
        this.child[index].getRect('.tab-item').then(res => {
          const { left, width } = res
          this.set({
            lineStyle: `width:${width / 2}px;transform: translateX(${left + width * .25}px);`
          })
        })
      }
    },
    switchTab (index) {
      this.set({
        current: index
      })
      this.triggerEvent('change', { value: index })
    }
  },
  created () {
    this.child = []
  },
  ready () {
    const { current } = this.data
    this.child.forEach((item, index) => {
      item.index = index
    })
    if (this.child.length > 4) {
      this.set({
        scroll: true
      })
    }
    this.updateCurrent(current)
  }
})
