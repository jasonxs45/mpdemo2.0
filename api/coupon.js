import { fetch, post } from './index'
/**================================
 *           优惠券
 ================================*/
//  列表
export const _list = ({ CityID = '', KeyWord = '', PageIndex = 1, PageSize = 10 }) => fetch({
  action: 'GetCouponPager',
  CityID,
  KeyWord,
  PageIndex,
  PageSize
})
//  我的优惠券列表
export const _mylist = ({ State, PageIndex, PageSize = 10, UnionID }) => fetch({
  action: 'GetMyCouponForPage',
  State,
  PageIndex,
  PageSize,
  UnionID
})
// 详情
export const _detail = ID => fetch({
  action: 'GetCouponInfo',
  ID
})
// 领取优惠券
export const _submit = ({ ID, UnionID, Tel }) => fetch({
  action: 'ReceiveCoupon',
  ID,
  UnionID,
  Tel
})
// 详情
export const _mydetail = ({ ID, UnionID }) => fetch({
  action: 'GetUserCouponTradeLog',
  ID,
  UnionID
})