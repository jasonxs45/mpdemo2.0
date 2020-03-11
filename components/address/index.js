import MComponent from '../../common/MComponent'
MComponent({
  properties: {
    icon: {
      type: Boolean,
      value: false
    },
    label: String,
    name: String,
    address: String,
    coordinate: Object,
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
    openMap() {
      const { latitude, longitude } = this.properties.coordinate
      if (!this.properties.readOnly) {
        wx.openLocation({
          latitude,
          longitude,
          name: this.properties.name,
          address: this.properties.address,
          fail: e => {
            console.log(e)
          }
        })
      }
    }
  }
})
