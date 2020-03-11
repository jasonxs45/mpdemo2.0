import MComponent from '../../common/MComponent'
MComponent({
  properties: {
    editable: {
      type: Boolean,
      value: false
    },
    value: Number,
    step: {
      type: Number,
      value: 1
    },
    max: {
      type: Number,
      value: Infinity
    },
    min: {
      type: Number,
      value: 0
    }
  },
  data: {},
  computed: {
    minusDisable () {
      const { value, min } = this.data
      return value <= min
    },
    plusDisable() {
      const { value, max } = this.data
      return value >= max
    }
  },
  methods: {
    updateValue (val) {
      let { max, min } = this.data
      if (typeof val !== 'number' || isNaN(val) || val <= min) {
        val = min
      } else if (val >= max) {
        val = max
      }
      return this.set({
        value: val
      })
    },
    minus () {
      let { value, step, minusDisable } = this.data
      if (minusDisable) {
        return
      }
      this.updateValue(value -= step).then(() => {
        const { value } = this.data
        this.triggerEvent('change', { value })
      })
    },
    plus () {
      let { value, step, plusDisable } = this.data
      if (plusDisable) {
        return
      } 
      this.updateValue(value += step).then(() => {
        const { value } = this.data
        this.triggerEvent('change', { value })
      })
    },
    inputHandler (e) {
      const { editable, min, max } = this.data
      if (!editable) {
        return
      }
    },
    blurHandler (e) {
      let value = Number(e.detail.value)
      this.updateValue(value).then(() => {
        const { value } = this.data
        this.triggerEvent('change', { value })
      })
    }
  },
  ready () {
    const { value, min, max } = this.data
    if (min < 0) {
      throw new Error('min不能小于0')
    }
    if (max <= 0) {
      this.data.max = Infinity
    }
    this.updateValue(value)
  }
})
