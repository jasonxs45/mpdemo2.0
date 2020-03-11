import { fetch } from './index'
// 通过uid查询用户信息
export const _getUserInfoByUid = uid => fetch({
  action: 'GetMySelfInfo',
  UnionID: uid
})
// 
export const _getWXUserInfo = ({ OpenId, iv, encryptedData }) => fetch({
  action: 'GetUserInfo',
  OpenId,
  iv,
  encryptedData
})
export const _getPhoneNumber = ({ OpenID, UnionID, iv, encryptedData }) => fetch({
  action: 'DecryptPhone',
  OpenID,
  UnionID,
  iv,
  encryptedData,
})