import MComponent from '../../common/MComponent'
const ANCESTOR_PATH = './tab-group'
MComponent({
  externalClasses: [
    'active-class'
  ],
  relations: {
    [ANCESTOR_PATH]: {
      type: 'ancestor',
      linked(target) {
        this.parent = target
      },
      unlinked(target) {
      }
    }
  },
  properties: {
    label: String
  },
  data: {
    active: false
  },
  computed: {
    scroll () {
      let res = false
      if (this.parent) {
        res = this.parent.data.scroll
      }
      return res
    }
  },
  methods: {
    onTap (e) {
      if (!this.parent) {
        return
      }
      const { current } = this.parent.data
      const { index } = this
      this.set({
        active: true
      })
      if (index != current) {
        this.parent.switchTab(index)
      }
    }
  },
  created () {
    this.parent = null
  }
})
