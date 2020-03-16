import { fetch, post } from './index'
/**================================
 *           礼品
 ================================*/
// 列表
export const _list = ({ CityID = 1, KeyWord, PageIndex, PageSize = 10 }) => fetch({
  action: 'GetGoodsPager',
  CityID,
  PageIndex,
  PageSize,
  KeyWord
})
// 详情
export const _detail = ID => fetch({
  action: 'GetGoodsInfo',
  ID
})
// 兑换
export const _exchange = ({ ID, UnionID }) => fetch({
  action: 'Shopping',
  ID,
  UnionID
})
// 我的礼品
export const _mylist = ({ State, PageIndex, PageSize = 10, UnionID }) => fetch({
  action: 'GetMyGoodsForPage',
  State,
  PageIndex,
  PageSize,
  UnionID
})
// 我的详情
export const _mydetail = ({ ID, UnionID }) => fetch({
  action: 'GetUserGoodsTradeLog',
  ID,
  UnionID
})
// 礼品列表背景图
export const _bg = () => fetch({
  action: 'GetGoodsBackgroundImg'
})