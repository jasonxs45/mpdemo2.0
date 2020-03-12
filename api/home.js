import { fetch, post } from './index'
/**================================
 *           首页
 ================================*/
export const _projects = ({ CityID = '' }) => fetch({
  action: 'GetHomeProject',
  CityID
})
export const _bannber = ({ CityID = '' }) => fetch({
  action: 'GetHomeBanner',
  CityID
})
export const _ads = ({ CityID = '' }) => fetch({
  action: 'GetAdvertisementByCity',
  CityID
})
export const _goods = ({ CityID = '' }) => fetch({
  action: 'GetProjectByGoods',
  CityID
})
export const _bg = () => fetch({
  action: 'GetHomeBackgroundImg'
})