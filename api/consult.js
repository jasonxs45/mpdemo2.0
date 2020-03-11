import { fetch, post } from './index'
/**================================
 *           置业顾问
 ================================*/
//  获取置业顾问列表
export const _list = ({ ProjectID }) => fetch({
  action: 'GetConsultantByProjectID',
  ProjectID
})
//  随机分配置业顾问
export const _dispatch = ({ UnionID, ProjectID, ConsultantID = '' }) => fetch({
  action: 'GetDialogueInfoFromProject',
  UnionID,
  ProjectID,
  ConsultantID
})
// 用户扫码后获得置业顾问信息
export const _scan = ({ UnionID, ConsultantID }) => fetch({
  action: 'GetDialogueInfoFromQRCode',
  UnionID,
  ConsultantID
})
// 置业顾问绑定矩客码
export const _bindJuke = ({ UnionID, JuKeCode }) => fetch({
  action: 'ConsultantGetJuKeCode',
  UnionID,
  JuKeCode
})
// 获取置业顾问名片
export const _indentity = ({ ConsultantID }) => fetch({
  action: 'GetConsultantCard',
  ConsultantID
})