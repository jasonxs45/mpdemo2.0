import MComponent from '../../common/MComponent'
const ANCESTOR_PATH = '../collapse-group/index'
const nextTick = () => new Promise(resolve => setTimeout(resolve, 20))
MComponent({
  relations: {
    [ANCESTOR_PATH]: {
      type: 'ancestor',
      linked(target) {
        this.parent = target
      }
    }
  },
  externalClasses: [
    'active-class'
  ],
  properties: {
    name: null,
    shadow: {
      type: Boolean,
      value: false
    }
  },
  data: {
    contentHeight: 0,
    expand: false,
    transition: false,
    _shadow: false
  },
  methods: {
    init() {
      if (!this.parent) {
        return Promise.resolve()
      }
      const { current, accordion } = this.parent.data
      const { child } = this.parent
      const { name } = this.data
      const index = child.indexOf(this)
      const currentName = name == null ? index : name
      const expand = accordion
        ? current === currentName
        : (current || []).some((name) => name === currentName)
      const stack = []
      if (expand !== this.data.expand) {
        stack.push(this.updateStyle(expand))
      }
      stack.push(this.set({
        index,
        expand
      }))
      return Promise.all(stack)
    },
    updateStyle(expand) {
      return this.getRect('.collapse-body-wrapper')
        .then(rect => rect.height)
        .then(height => {
          if (expand) {
            return this.set({
              contentHeight: height ? `${height}px`: 'auto'
            })
          } else {
            return this.set({
              contentHeight: `${height}px`
            }).then(nextTick)
            .then(() => {
              this.set({
                contentHeight: 0
              })
            })
          }
        })
    },
    onTap() {
      const { name, index, expand } = this.data
      const currentName = name === null ? index : name
      this.set({
        _shadow: true
      })
      if (this.parent) {
        this.parent.accordionChange(currentName, !expand)
      } else {
        this.set({
          expand: !expand
        })
        this.updateStyle(!expand)
      }
    },
    onTransitionEnd() {
      this.set({
        _shadow: false
      })
      if (this.data.expand) {
        this.set({
          contentHeight: 'auto'
        })
      }
    }
  },
  ready() {
    this.init()
      .then(nextTick)
      .then(res => {
        this.setData({
          transition: true
        })
      })
  }
})
