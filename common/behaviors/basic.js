import { setData } from '../base'
export default Behavior({
  attched () {
    this.set()
  },
  methods: {
    // 获取元素宽高方位
    getRect(selector, all) {
      return new Promise(resolve => {
        wx.createSelectorQuery()
          .in(this)[all ? 'selectAll' : 'select'](selector)
          .boundingClientRect(rect => {
            if (all && Array.isArray(rect) && rect.length) {
              resolve(rect);
            }
            if (!all && rect) {
              resolve(rect);
            }
          })
          .exec()
      })
    },
    'set': setData 
  }
})