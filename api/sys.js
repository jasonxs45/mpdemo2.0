import { fetch } from './index'
// login
export const _sysConf = () => fetch({
  action: 'GetSYSConfig'
})