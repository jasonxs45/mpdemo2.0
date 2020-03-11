function setAsync(context, data) {
  return new Promise((resolve, reject) => {
    context.setData(data, resolve)
  })
}
// 把this.setData封装成Promise形式
function setData(data, callback) {
  const stack = []
  if (data) {
    stack.push(setAsync(this, data))
  }
  return Promise.all(stack).then(res => {
    if (callback && typeof callback === 'function') {
      callback.call(this)
    }
    return res
  })
}
// 计算安全区域
let cache = null
function getSafeArea() {
  return new Promise((resolve, reject) => {
    if (cache != null) {
      resolve(cache)
    } else {
      wx.getSystemInfo({
        success: ({ model, screenHeight, statusBarHeight }) => {
          const iphoneX = /iphone x/i.test(model)
          const iphoneNew = /iPhone11/i.test(model) && screenHeight === 812
          cache = {
            isIphoneX: iphoneX || iphoneNew,
            statusBarHeight
          }
          resolve(cache)
        },
        fail: reject
      })
    }
  })
}
export {
  setData,
  getSafeArea
}