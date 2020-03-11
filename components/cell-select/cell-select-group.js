import MComponent from '../../common/MComponent'
const DESCENDANT_PATH = './cell-select-item'
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
    multiple: {
      type: Boolean,
      value: false,
      observer: 'updateExpand'
    },
    current: {
      type: null,
      observer: 'updateExpand'
    }
  },
  methods: {
    updateExpand(val) {
      this.child.forEach(child => {
        child.init()
      })
    },
    accordionChange(name, checked) {
      const { multiple, current } = this.data
      if (multiple) {
        name = checked
          ? (current || []).concat(name)
          : (current || []).filter((activeName) => activeName !== name)
      }
      else {
        // name = checked ? name : ''
      }
      this.triggerEvent('change', { value: name })
    }
  },
  created() {
    this.child = []
  }
})
