import { rengouUrl } from '../../api/urls'
var globalData = {
  isIpx:false,
  member: null,
  memberData: null,
  userInfo: null,
  data: {},
  https: rengouUrl
}
function onlogin() {
  wx.showLoading({title: '加载中..', mask: true});
  let that = this
  return new Promise(function(resolve, reject) {
    wx.login({
      success: loginRes => {
        fetch('/MiniProgram/Purchase/OnLogin', {
          code: loginRes.code,
        }, function(res) {
          resolve(res.data)
        })
      }
    })
  })
}

function getUserInfo() {
  let that = this
  return new Promise(function(resolve, reject) {
    wx.getUserInfo({
      success: res => {
        globalData.userInfo = res.userInfo
        fetch('/MiniProgram/Purchase/GetUserInfo', {
          encryptedData: res.encryptedData,
          iv: res.iv,
          key: globalData.data.sessionId
        }, function(resc) {
          resolve(resc.data)
        })
      }
    })
  })
}

function getMemberInfo(unionid) {
  return new Promise(function(resolve, reject) {
    fetch('/MiniProgram/Purchase/GetMemberInfo', {
      unionid: unionid
    }, function(resc) {
      resolve(resc.data)
    })
  })
}
function authorization(){
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          onlogin().then(function (res) {
            console.log('onlogin', res)
            if (res.IsSuccess) {
              globalData.data = res.Data
              return getUserInfo()
            } else {
              wx.hideLoading()
              console.log('onlogin：失败')
              wx.showToast({ title: res.Msg, icon: 'none', duration: 2000 });
              resolve()
              return
            }
          }).then(function (res) {
            wx.hideLoading()
            console.log('getUserInfo', res)
            wx.hideLoading()
            if (res.IsSuccess) {
              let status = false
              if (res.Data.Member) {
                globalData.member = res.Data.Member.memberId
                globalData.memberData = res.Data.Member
                globalData.data.unionid = res.Data.Fans.unionID
                resolve(res.Data.Member)
              } else {
                console.log('没注册')
                wx.redirectTo({
                  url: '/pages/subscribe/subscribe/index',
                })
                resolve()
              }
            } else {
              resolve()
              wx.showToast({ title: res.Msg, icon: 'none', duration: 2000 });
            }
          })
        } else {
          console.log('没授权')
          onlogin().then(function (res) {
            console.log('onlogin', res)
            if (res.IsSuccess) {
              globalData.data = res.Data
              if (res.Data.unionid) {
                return getMemberInfo(res.Data.unionid)
              } else {
                console.log('没授权:unionid')
                resolve()
                return
              }
              resolve()
            } else {
              resolve()
              wx.hideLoading()
              wx.showToast({ title: res.Msg, icon: 'none', duration: 2000 });
            }
          }).then(function (res) {
            wx.hideLoading()
            console.log('getMemberInfo', res)
            if (res.IsSuccess) {
              let status = false
              if (res.Data.member) {
                globalData.member = res.Data.member.memberId
                globalData.memberData = res.Data.member
                resolve(res.Data.member)
              }else{
                console.log('没注册')
                wx.redirectTo({
                  url: '/pages/subscribe/subscribe/index',
                })
              }
              globalData.data.unionid = res.Data.fans.unionID
            } else {
              resolve()
              wx.showToast({ title: res.Msg, icon: 'none', duration: 2000 });
            }
          })
        }
      }
    })
  })
}
function fetch(url, data, cb) {
  wx.request({
    url: globalData.https + url,
    data: data,
    success(request) {
      typeof cb == "function" && cb(request);
    },
    fail: function(err) {
      console.log('网络错误')
      wx.hideLoading();
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000
      });
    }
  })
}
module.exports = {
  fetch: fetch,
  onlogin: onlogin,
  getUserInfo: getUserInfo,
  getMemberInfo: getMemberInfo,
  globalData: globalData,
  authorization: authorization
}