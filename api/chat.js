import { fetch, post } from './index'
/**================================
 *           在线客服
 ================================*/
//  用户获取置业顾问列表
export const _usergetlist = ({ UnionID, PageIndex, PageSize = 50 }) => fetch({
  action: 'GetMyConsultant',
  PageIndex,
  PageSize,
  UnionID
})
// 置业顾问获取用户预约列表
export const _managergetlist = ({ ConsultantID, PageIndex, PageSize = 50 }) => fetch({
  action: 'GetConsultantAppointment',
  PageIndex,
  PageSize,
  ConsultantID
})
// 客户列表
export const _customerslist = ({ ConsultantID, PageIndex, PageSize = 50 }) => fetch({
  action: 'ConsultantGetUser',
  PageIndex,
  PageSize,
  ConsultantID
})
// 置业顾问确认到访
export const _managerconfirm = AppointmentID => fetch({
  action: 'AppointmentCheck',
  AppointmentID
})
// 获取聊天记录
export const _dialoglist = ({
  ConsultantID,//置业顾问ID
  UserUnionID,//用户粉丝ID
  FromUnionID,//发送者粉丝ID
  ToUnionID,//接收者粉丝ID
  StartID,//开始ID
  EndID//结束ID 
}) => fetch({
  action: 'GetDialogue',
  ConsultantID,
  UserUnionID,
  FromUnionID,
  ToUnionID,
  StartID,
  EndID
})
// 发送聊天内容
export const _sendmsg = ({
  ConsultantID,//置业顾问ID
  UserUnionID,//用户粉丝ID
  FromUnionID,//发送者粉丝ID
  ToUnionID,//接收者粉丝ID
  Type,////消息类型:text, image, voice
  Content,//发送内容
  form_id
}) => fetch({
  action: 'SendDialogue',
  ConsultantID,
  UserUnionID,
  FromUnionID,
  ToUnionID,
  Type,
  Content,
  form_id
})