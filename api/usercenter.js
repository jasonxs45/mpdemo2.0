import { fetch, post } from './index'
//  收藏列表
export const _collectlist = ({ Type, UnionID, PageIndex, PageSize }) => fetch({
  action: 'GetMyCollectionForPage',
  Type,
  UnionID,
  PageIndex,
  PageSize
})
//  分享列表
export const _sharelist = ({ Type, UnionID, PageIndex, PageSize }) => fetch({
  action: 'GetMyShareForPage',
  Type,
  UnionID,
  PageIndex,
  PageSize
})
// 我的积分
export const _scorelist = ({ UnionID, PageIndex, PageSize }) => fetch({
  action: 'GetMyPointLogForPage',
  UnionID,
  PageIndex,
  PageSize
})
// 绑定业主
export const _bind = ({ UnionID, Name, IDCard }) => fetch({
  action: 'BindHouse',
  UnionID,
  Name,
  IDCard
})
// 查询身份
export const _identity = UnionID => fetch({
  action: 'GetMyBindHouse',
  UnionID
})
// 查询是否用认购模块
export const _checkTrade = () => fetch({
  action: 'GetIsShowIdentifyChips'
})