import { fetch, post } from './index'
/**================================
 *           个人信息
 ================================*/
// 获取粉丝与对象扩展信息
// action：GetFansProjectInfo
// FansID：用户粉丝ID
// ObjectID：收藏项目ID
// Type：收藏类型：Project项目、HuXing户型、News新闻  Active活动
export const _memberextinfo = ({ UnionID, ObjectID, Type }) => fetch({
  action: 'GetFansObjectInfo',
  UnionID,
  ObjectID,
  Type
})
// 置业顾问获取自己的二维码
export const _consultcode = ({ ConsultantID }) => fetch({
  action: 'CreateConsultantQRcode',
  ConsultantID
})
// 授权后加积分
export const _registaddpoint = ({
  ShareUnionID,
  UnionID,
  ObjectID,
  Type
}) => fetch({
  action: 'SignByShareUnionID',
  ShareUnionID,
  UnionID,
  ObjectID,
  Type
})