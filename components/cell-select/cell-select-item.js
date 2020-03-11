import MComponent from '../../common/MComponent'
const ANCESTOR_PATH = './cell-select-group'
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
    'cell-select-active-class'
  ],
  properties: {
    label: String,
    name: null,
    disabled: Boolean,
    round: {
      type: Boolean,
      value: true
    }
  },
  data: {
    checked: false,
  },
  methods: {
    init() {
      if (!this.parent) {
        return Promise.resolve()
      }
      const { current, multiple } = this.parent.data
      const { child } = this.parent
      const { name } = this.data
      const index = child.indexOf(this)
      const currentName = name == null ? index : name
      const checked = multiple
        ? (current || []).some((name) => name === currentName)
        : current === currentName
      return this.set({
        index,
        checked
      })
    },
    onTap() {
      const { name, index, checked, disabled } = this.data
      if (disabled) {
        return
      }
      const currentName = name === null ? index : name
      if (this.parent) {
        this.parent.accordionChange(currentName, !checked)
      } else {
        const { multiple } = this.parent.data
        this.set({
          checked: !checked
        })
      }
    }
  },
  ready() {
    this.init()
  }
})
