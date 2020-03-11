import MComponent from '../../common/MComponent'
const DESCENDANT_PATH = '../collapse-item/index'
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
    accordion: {
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
    accordionChange(name, expand) {
      const { accordion, current } = this.data
      if (!accordion) {
        name = expand
          ? (current || []).concat(name)
          : (current || []).filter((activeName) => activeName !== name);
      }
      else {
        name = expand ? name : '';
      }
      this.triggerEvent('change', name)
    }
  },
  created() {
    this.child = []
  }
})
