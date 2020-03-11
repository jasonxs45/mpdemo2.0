import { fetch, post } from './index'
/**================================
 *           扫码
 ================================*/
export const _analysiscode = ({ Type, ObjectID, UnionID }) => fetch({
  action: 'CheckByQRCode',
  Type,
  ObjectID,
  UnionID
})