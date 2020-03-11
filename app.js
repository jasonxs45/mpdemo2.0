import { toast, loading } from './utils/util'
import { store } from './store/index'
import _login from './api/login'
import { _addshare } from './api/projects'
import { _getUserInfoByUid, _getWXUserInfo } from '/api/getuserinfo'
import { _reddit } from '/api/message'
import { _sysConf } from '/api/sys'
import { mtaInit } from './config/mta'
App({
  TOTAL_UNIT: '万元/套',
  UNIT: '元/平',
  shareInfo: {
    title: '世茂海峡U选欢迎您！'
  },
  globalData: {
    memberInfo: null
  },
  toast,
  loading,
  getReddit(tmplIds, next) {
    loading('加载中')
    wx.getSetting({
      withSubscriptions: true,
      success: r => {
        // 如果总开关未打开，弹出设置提示
        if (!r.subscriptionsSetting.mainSwitch) {
          wx.hideLoading()
          wx.showModal({
            title: '温馨提示',
            content: '您已关闭订阅消息，后续可能收不到消息推送，需要设置吗？',
            success: r => {
              if (r.cancel) {
                // 忽略的话直接进入下一步
                next && next()
              }
              if (r.confirm) {
                wx.openSetting({})
              }
            }
          })
        } else {
          const { itemSettings } = r.subscriptionsSetting
          // 如果部分模板消息被禁止，提示设置
          if (itemSettings && tmplIds.some(item => itemSettings[item] === 'reject')) {
            wx.hideLoading()
            wx.showModal({
              title: '温馨提示',
              content: '您已关闭部分订阅消息，后续可能收不到消息推送，需要设置吗？',
              success: r => {
                if (r.cancel) {
                  // 忽略的话直接进入下一步
                  next && next()
                }
                if (r.confirm) {
                  wx.openSetting({})
                }
              }
            })
          } else {
            // 订阅消息正常打开
            wx.requestSubscribeMessage({
              tmplIds,
              success: res => {
                wx.hideLoading()
                // 授权弹窗点击允许和取消都会进入success，不能中断正常流程
                next && next()
                // 获取状态为accept的模板消息
                const arr = tmplIds.filter(item => res[item] === 'accept')
                // 维护对应模板消息的次数
                if (arr.length) {
                  console.log(arr)
                  // 需要发送请求维护订阅消息的次数
                  const OpenID = wx.getStorageSync('openid')
                  wx.showNavigationBarLoading()
                  console.log(arr)
                  if (OpenID) {
                    _reddit({
                      OpenID,
                      TempIDList: JSON.stringify(arr)
                    })
                      .then(res => {
                        wx.hideNavigationBarLoading()
                        const { code } = res.data
                        if (code === 0) {
                          console.log('订阅成功')
                        } else {
                          console.log('订阅失败')
                        }
                      })
                      .catch(err => {
                        wx.hideNavigationBarLoading()
                        console.log('订阅请求报错', err)
                      })
                  } else {
                    console.log('openid未找到')
                  }
                }
              },
              fail: err => {
                wx.hideLoading()
                console.log(err)
                // wx.showModal({
                //   title: '温馨提示',
                //   content: JSON.stringify(err),
                //   showCancel: false
                // })
                toast(JSON.stringify(err))
                next && next()
              }
            })
          }
        }
      }
    })
  },
  checkAuth() {
    let uid = wx.getStorageSync('uid')
    return new Promise((resolve, reject) => {
      if (uid) {
        resolve(uid)
      } else {
        // 登录获取uid
        wx.login({
          success: r => {
            if (r.code) {
              _login(r.code)
                .then(res => {
                  if (res.data.code === 0) {
                    console.log(res.data.data)
                    let {
                      OpenId: openid,
                      SessionKey: session_key,
                      UnionId: unionid
                    } = res.data.data
                    unionid = unionid || wx.getStorageSync('uid')
                    if (unionid) {
                      resolve(unionid)
                    } else {
                      reject('登录没有uid')
                    }
                    wx.setStorageSync('openid', openid)
                    wx.setStorageSync('uid', unionid)
                    wx.setStorageSync('s_key', session_key)
                  } else {
                    reject(res.data.msg)
                  }
                })
                .catch(err => {
                  reject(err)
                })
            }
          }
        })
      }
    })
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: r => {
          if (r.code) {
            _login(r.code)
              .then(res => {
                const { code, msg, data } = res.data
                if (code === 0) {
                  console.log(data)
                  let { OpenId, SessionKey, UnionId } = data
                  UnionId = UnionId || wx.getStorageSync('uid')
                  resolve({ OpenId, SessionKey, UnionId })
                  wx.setStorageSync('openid', OpenId)
                  wx.setStorageSync('uid', UnionId)
                  wx.setStorageSync('s_key', SessionKey)
                } else {
                  reject(res.data)
                }
              })
              .catch(err => {
                reject(err)
              })
          }
        }
      })
    })
  },
  getUserInfoByUid(uid, force = false) {
    const memberInfo = wx.getStorageSync('member')
    return new Promise((resolve, reject) => {
      // force || !memberInfo
      if (1) {
        _getUserInfoByUid(uid)
          .then(res => {
            if (res.data.code === 0) {
              this.globalData.memberInfo = res.data.data
              wx.setStorageSync('member', res.data.data)
              store.updateMember(res.data.data)
              resolve(res.data.data)
            } else {
              reject(res.data)
              wx.removeStorageSync('member')
              store.updateMember(null)
            }
          })
          .catch(err => {
            reject(err)
            wx.removeStorageSync('member')
            store.updateMember(null)
          })
      } else {
        resolve(memberInfo)
      }
    })
  },
  onGetWXUserInfo(e) {
    const { iv, encryptedData } = e.detail
    return new Promise((resolve, reject) => {
      if (iv) {
        loading('加载中')
        const OpenId = wx.getStorageSync('openid')
        _getWXUserInfo({ OpenId, iv, encryptedData })
          .then(res => {
            wx.hideLoading()
            const { code, data, msg } = res.data
            if (code === 0) {
              const { Fans, User } = data
              const member = Fans[0]
              let { openId, unionId, avatarUrl, nickName } = User
              unionId && wx.setStorageSync('uid', unionId)
              member && wx.setStorageSync('member', member)
              resolve({ unionId, member })
            } else {
              wx.showModal({
                title: '对不起',
                content: msg,
                showCancel: false
              })
            }
          })
          .catch(err => {
            console.log(err)
            wx.hideLoading()
            wx.showModal({
              title: '对不起',
              content: JSON.stringify(err),
              showCancel: false
            })
          })
      } else {
        wx.showModal({
          title: '温馨提示',
          content: '您已拒绝授权',
          showCancel: false
        })
      }
    })
  },
  checkMember () {
    let member = wx.getStorageSync('member')
    return new Promise((resolve, reject) => {
      if (member) {
        resolve(member)
      } else {
        reject('本地缓存无member')
      }
    })
  },
  addShare (opt) {
    const { id: ObjectID, type: Type } = opt
    const ShareUnionID = wx.getStorageSync('shareuid')
    const UnionID = wx.getStorageSync('uid') || ''
    console.log(ShareUnionID, UnionID, ObjectID, Type)
    if (!ObjectID || !Type || !ShareUnionID) {
      return
    }
    console.log('授权后增加分享')
    _addshare({ ShareUnionID, UnionID, ObjectID, Type })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
  },
  getSysConf () {
    return new Promise((resolve, reject) => {
      _sysConf()
        .then(res => {
          const { code, msg, data } = res.data
          if (code ===0) {
            console.log(data)
            resolve(data)
          } else {
            reject(msg)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  onLaunch() {
// 腾讯流量统计
    mtaInit()
  }
})