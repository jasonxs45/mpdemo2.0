import MComponent from '../../common/MComponent'
const classMap = {
  justify: {
    justify: 'space-between',
    center: 'justify-center'
  },
  align: {
    center: 'align-center'
  },
  vertical: 'vertical'
}
MComponent({
  properties: {
    justify: String,
    align: String,
    wrap: {
      type: Boolean,
      observer(val) {
        const { classes } = this.data
        if (val) {
          classes.push('wrap')
        } else {
          classes.splice(classes.findIndex(item => item === 'wrap'), 1)
        }
        this.set({
          classes
        })
      }
    },
    vertical: {
      type: Boolean,
      observer (val) {
        const { classes } = this.data
        if (val) {
          classes.push('vertical')
        } else {
          classes.splice(classes.findIndex(item => item === 'vertical'), 1)
        }
        this.set({
          classes
        })
      }
    }
  },
  data: {
    classes: []
  },
  methods: {
    updateClasses () {
      const { classes, justify, align } = this.data
      if (justify) {
        classes.push(classMap.justify[justify])
      }
      if (align) {
        classes.push(classMap.align[align])
      }
      this.set({
        classes
      })
    }
  },
  ready () {
    this.updateClasses()
  }
})
