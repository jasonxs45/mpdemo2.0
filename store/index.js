import { observable, action } from 'mobx-miniprogram'
export const store = observable({
  // 数据字段
  member: wx.getStorageSync('member'),
  keyword: '',
  city: null,
  cityList: [],
  sysConf: null,
  // actions
  updateMember: action(function(member) {
    this.member = member
  }),
  updateKeyword: action(function (keyword) {
    this.keyword = keyword
  }),
  updateCity: action(function (city) {
    this.city = city
  }),
  updateCityList: action(function (cityList) {
    this.cityList = cityList
  }),
  updateSysConf: action(function (sysConf) {
    this.sysConf = sysConf
  })
})