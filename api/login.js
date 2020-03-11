import { fetch } from './index'
// login
const _login = code => fetch({
  action: 'Login',
  code
})
export default _login