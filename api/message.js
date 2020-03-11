import { fetch, post } from './index'
/**================================
 *          登记订阅消息
 ================================*/
//  登记订阅消息
export const _reddit = ({ OpenID, TempIDList }) => post({
  action: 'ManageSubscribeMessage',
  OpenID,
  TempIDList
})