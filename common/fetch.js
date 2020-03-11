import { baseUrl } from './urls'
const url = `${baseUrl}/api.aspx?action=${api}`
const fetch = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      success: res => {
        if (res.statusCode == 200) {
          resolve(res)
        } else {
          reject(`code:${res.statusCode}，请检查后台代码`)
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })
}