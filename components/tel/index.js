import MComponent from '../../common/MComponent'
MComponent({
  properties: {
    icon: {
      type: Boolean,
      value: false
    },
    label: String,
    phoneNumber: String,
    readOnly: {
      type: Boolean,
      value: false
    },
    custom: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    makecall() {
      if (!this.properties.readOnly) {
        wx.makePhoneCall({
          phoneNumber: this.properties.phoneNumber
        })
      }
    }
  }
})
