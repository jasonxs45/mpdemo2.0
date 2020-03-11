import { fetch, post } from './index'
/**================================
 *           新闻中心
 ================================*/
//  新闻列表
export const _category = () => fetch({
  action: 'GetNewsType'
})
//  新闻列表
export const _list = ({ CityID = '', Type, PageIndex, PageSize }) => fetch({
   action: 'GetNewsPager',
   CityID,
   Type,
   PageIndex,
   PageSize
 })
//  新闻详情
export const _newsdetail = ID => fetch({
  action: 'GetNewsInfo',
  ID
})
//  公告详情
export const _detail = Code => fetch({
  action: 'GetNotice',
  Code
})