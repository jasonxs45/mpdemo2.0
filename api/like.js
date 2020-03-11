import { fetch, post } from './index'
/**================================
 *           收藏模块
 ================================*/
 // Project项目、HuXing户型、News新闻  Active活动
//  查询是否收藏
export const _checklike = ({ UnionID, ObjectID, Type }) => fetch({
  action: 'IsCollect',
  UnionID,
  ObjectID,
  Type
})
// 收藏与取消
export const _like = ({ UnionID, ObjectID, Type }) => fetch({
  action: "Collect",
  UnionID,
  ObjectID,
  Type
})