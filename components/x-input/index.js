import MComponent from '../../common/MComponent'
MComponent({
  behaviors: ['wx://form-field'],
  properties: {
    clear: {
      type: Boolean,
      value: true
    },
    initValue: {
      type: String,
      observer (val) {
        this.set({
          value: val
        })
      }
    },
    value: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'text'
    },
    password: {
      type: Boolean,
      value: false
    },
    placeholder: {
      type: String,
      value: ''
    },
    placeholderStyle: {
      type: 'String',
      value: ''
    },
    placeholderClass: {
      type: 'String',
      value: 'input-placeholder'
    },
    disabled: {
      type: Boolean,
      value: false
    },
    maxlength: {
      type: Number,
      value: 140
    },
    cursorSpacing: {
      type: [Number, String],
      value: 0
    },
    focus: {
      type: Boolean,
      value: false
    },
    confirmType: {
      type: String,
      value: 'done'
    },
    confirmHold: {
      type: Boolean,
      value: false
    },
    cursor: {
      type: Number
    },
    selectionStart: {
      type: Number,
      value: -1
    },
    selectionEnd: {
      type: Number,
      value: -1
    },
    adjustPosition: {
      type: Boolean,
      value: true
    }
  },
  data: {
    focusing: false,
    selecting: false,
    resultIndex: null
  },
  methods: {
    clear() {
      this.data.value = ''
      this.setData({
        value: this.data.value
      }, () => {
        this.triggerEvent('input', { value: '' })
      })
      this.triggerEvent('clear', { value: '' })
    },
    inputHandler(e) {
      this.setData({
        value: e.detail.value
      }, () => {
        this.triggerEvent('input', { value: e.detail.value })
      })
      // this.triggerEvent('input', e.detail.value)
    },
    blurHandler(e) {
      this.triggerEvent('blur', { value: e.detail.value })
    },
    focusHandler(e) {
      this.setData({
        focusing: true
      })
      this.triggerEvent('focus')
    },
    confirmHandler(e) {
      this.triggerEvent('confirm')
    }
  },
  lifetimes: {
    attached () {
      const { initValue } = this.data
      this.set({
        value: initValue
      })
    }
  }
})
