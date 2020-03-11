import { fetch, post } from './index'
/**================================
 *           在线客服
 ================================*/
//  用户获取在线客服
export const _usergetlist = ({ UnionID, PageIndex, PageSize = 50 }) => fetch({
  action: 'GetMyCustomerService',
  PageIndex,
  PageSize,
  UnionID
})
// 获取客服聊天两边信息
export const _serviceInfo = ({ CustomerServiceID, UnionID}) => fetch({
  action: 'GetCustomerServiceDialogueBothSidesInfo',
  CustomerServiceID,
  UnionID,
})
// 客服获取我的用户列表
export const _customerslist = ({ CustomerServiceID, PageIndex, PageSize = 50 }) => fetch({
  action: 'CustomerServiceGetUser',
  CustomerServiceID,
  PageIndex,
  PageSize
})
// 获取聊天记录
export const _dialoglist = ({
  CustomerServiceID,//客服ID
  UserUnionID,//用户粉丝ID
  FromUnionID,//发送者粉丝ID
  ToUnionID,//接收者粉丝ID
  StartID,//开始ID
  EndID//结束ID 
}) => fetch({
  action: 'GetCustomerServiceDialogue',
  CustomerServiceID,
  UserUnionID,
  FromUnionID,
  ToUnionID,
  StartID,
  EndID
})
// 发送聊天内容
export const _sendmsg = ({
  CustomerServiceID,//客服ID
  UserUnionID,//用户粉丝ID
  FromUnionID,//发送者粉丝ID
  ToUnionID,//接收者粉丝ID
  Type,////消息类型:text, image, voice
  Content//发送内容
}) => fetch({
  action: 'SendCustomerServiceDialogue',
  CustomerServiceID,
  UserUnionID,
  FromUnionID,
  ToUnionID,
  Type,
  Content
})