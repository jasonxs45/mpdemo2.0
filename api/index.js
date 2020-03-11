import { apiUrl, renGouApiUrl } from './urls'
const fetch = data => new Promise((resolve, reject) => {
  wx.request({
    url: `${apiUrl}`,
    method: 'GET',
    data,
    success: res => {
      if (res.statusCode == 200) {
        resolve(res)
      } else {
        reject(res.data)
        wx.showModal({
          title: '对不起',
          content: `请求错误，code:${res.statusCode}`,
          showCancel: false
        })
      }
    },
    fail: err => {
      reject(err)
      wx.hideLoading()
      // wx.showModal({
      //   title: '对不起',
      //   content: '请求错误，请稍后再试',
      //   showCancel: false
      // })
    }
  })
})
const post = data => new Promise((resolve, reject) => {
  wx.request({
    url: `${apiUrl}`,
    method: 'POST',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data,
    success: res => {
      if (res.statusCode == 200) {
        resolve(res)
      } else {
        reject(`请求错误，code:${res.statusCode}`)
        wx.showModal({
          title: '对不起',
          content: `请求错误，code:${res.statusCode}`,
          showCancel: false
        })
      }
    },
    fail: err => {
      reject(err)
      wx.hideLoading()
      // wx.showModal({
      //   title: '对不起',
      //   content: '请求错误，请稍后再试',
      //   showCancel: false
      // })
    }
  })
})
export const rengouFetch = ({ api, data }) => new Promise((resolve, reject) => {
  wx.request({
    url: `${renGouApiUrl}${api}`,
    method: 'GET',
    data,
    success: res => {
      if (res.statusCode == 200) {
        resolve(res)
      } else {
        reject(res.data)
        wx.showModal({
          title: '对不起',
          content: `请求错误，code:${res.statusCode}`,
          showCancel: false
        })
      }
    },
    fail: err => {
      reject(err)
      wx.hideLoading()
      // wx.showModal({
      //   title: '对不起',
      //   content: '请求错误，请稍后再试',
      //   showCancel: false
      // })
    }
  })
})
export {
  fetch,
  post
}