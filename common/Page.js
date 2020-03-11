import { setData } from '../common/base'
export default function (opt) {
  return Page({
    'set': setData,
    onShareAppMessage () {
      return getApp().shareInfo
    },
    ...opt
  })
}