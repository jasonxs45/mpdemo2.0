import { fetch, post } from './index'
/**================================
 *           活动板块
 ================================*/
//  列表
export const _list = ({ CityID = 1, State, PageIndex, PageSize }) => fetch({
  action: 'GetActivityPager',
  CityID,
  State,
  PageIndex,
  PageSize
})
//  我的活动列表
export const _mylist = ({ UnionID, PageIndex, PageSize }) => fetch({
  action: 'GetMyActivityForPage',
  UnionID,
  PageIndex,
  PageSize
})
// 详情
export const _detail = ID => fetch({
  action: 'GetActivityInfo',
  ID
})
// 报名
export const _submit = ({ ID, UnionID, Tel }) => fetch({
  action: 'ApplyActivity',
  ID,
  UnionID,
  Tel
})
// 详情
export const _mydetail = ({ ID, UnionID }) => fetch({
  action: 'GetUserActivitySignLog',
  ID,
  UnionID
})