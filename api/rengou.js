import { rengouFetch as fetch } from './index'
/**================================
 *               认购
 ================================*/
//  判断认购置业顾问身份
export const _rengouConsult = ({ fansId }) => fetch({
  api: '/Purchase/IsStaff',
  data: {
    fansId
  }
})
//  判断认筹置业顾问身份
export const _renchouConsult = ({ fansId }) => fetch({
  api: '/Deposit/IsStaff',
  data: {
    fansId
  }
})