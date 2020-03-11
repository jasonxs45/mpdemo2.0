import { uploadUrl } from './urls'
// 上传文件
const _uploadFile = filePath => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'imgFile',
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
export {
  _uploadFile
}