import MComponent from '../../common/MComponent'
MComponent({
  properties: {
    heart: {
      type: Boolean,
      value: false,
      observer (val) {
        if (val) {
          this.data.icon ='heart'
        }
      }
    },
    max: {
      type: Number,
      value: 5,
      observer: 'updateTypes'
    },
    value: {
      type: Number,
      value: 0,
      observer: 'updateTypes'
    },
    readOnly: {
      type: Boolean,
      value: false
    },
    half: {
      type: Boolean,
      value: false,
      observer: 'updateTypes'
    },
    size: {
      type:String,
      value: '40rpx'
    }
  },
  data: {
    types: [],
    icon: 'star',
    left: 0
  },
  methods: {
    onTap (e) {
      const { readOnly, half, max, icon } = this.data
      if (readOnly) {
        return
      }
      let types = []
      let value = 0
      if (!half) {
        let value = e.currentTarget.dataset.index + 1
        for (let i = 0; i < max; i++) {
          types.push(i > value - 1 ? `${icon}` : `${icon}-fill`)
        }
        this.data.value = value
        this.set({
          types
        })
        this.triggerEvent('change', { value })
      } else {
        let value = e.currentTarget.dataset.index + 1
        const { left, size } = this.data
        const { offsetLeft } = e.currentTarget
        const { x: pageX } = e.detail
        this.getRect('.rate-container').then(res => {
          const { width } = res
          const dist = pageX - offsetLeft
          if (dist <= width / max /2) {
            // 不过半
            value = value - 0.5
          }
          value = Math.floor((value) * 2) / 2
          for (let i = 0; i < max; i++) {
            const type = i < Math.floor(value)
              ? `${icon}-fill`
              : i >= Math.ceil(value)
                ? `${icon}`
                : `${icon}-half`
            types.push(type)
          }
          for (let i = 0; i < max; i++) {
            types.push(i > value - 1 ? `${icon}` : `${icon}-fill`)
          }
          this.data.value = value
          this.set({
            types
          })
          this.triggerEvent('change', { value })
        })
      }
    },
    updateTypes (val) {
      let { icon, half, value, max, types } = this.data
      // 仅展示
      if (this.data.readOnly) {
        if (!half) {
          types = []
          for (let i = 0; i < max; i++) {
            types.push(i > value - 1 ? `${icon}` : `${icon}-fill`)
          }
        } else {
          types = []
          value = Math.floor((value) * 2) / 2
          for (let i = 0; i < max; i++) {
            const type = i < Math.floor(value)
              ? `${icon}-fill`
              : i >= Math.ceil(value)
                ? `${icon}`
                : `${icon}-half`
            types.push(type)
          }
        }
      } 
      // 可评分时, max, value, half改变将样式还原成空心
      else {
        types = []
        for (let i = 0; i < max; i++) {
          types.push(`${icon}`)
        }
      }
      this.set({
        types
      })
    }
  },
  created () {},
  attached () {
    this.updateTypes()
  },
  ready () {
    if (this.data.half && !this.data.readOnly) {
      const { max } = this.data
      this.getRect('.rate-container').then(res => {
        const { left } = res
        this.set({
          left
        })
      })
    }
  }
})