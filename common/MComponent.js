import basic from './behaviors/basic'
import computed from './behaviors/computed'
import { safeArea } from './behaviors/safe-area'
function MComponent(opt = {}, page = false) {
  // 处理properties以及对应的observer
  if (opt.properties) {
    let props = opt.properties
    Object.keys(props).forEach(key => {
      let prop = props[key]
      if (prop === null || !('type' in prop)) {
        prop = { type: prop }
      }
      let { observer } = prop
      prop.observer = function () {
        if (observer) {
          if (typeof observer === 'string') {
            observer = this[observer]
          }
          observer.apply(this, arguments)
        }
        this.set()
      }
      props[key] = prop
    })
  }
  // 处理与其他节点关系
  if (opt.relations) {
    // console.log(opt.relations)
  }
  // 添加behaviors
  opt.behaviors = opt.behaviors || []
  opt.behaviors.push(basic)
  opt.behaviors.push(computed)
  opt.behaviors.push(safeArea())
  // 添加默认的options
  opt.options = {
    multipleSlots: true,
    addGlobalClass: true
  }
  // 添加默认的外部externalClass
  opt.externalClasses = opt.externalClasses || []
  opt.externalClasses.push('custom-class')
  // 如果用来创建页面
  opt.methods = opt.methods || {}
  if (page) {
    opt.methods.onShareAppMessage = opt.methods.onShareAppMessage || function () {
      return getApp().shareInfo
    }
  }
  return Component(opt)
}
export default MComponent