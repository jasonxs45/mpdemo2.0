const mta = require('../utils/mta_analysis.js')
// 腾讯流量统计
export const mtaInit = () => {
  console.log('流量统计初始化')
  mta.App.init({
    "appID": "500710382",
    "autoReport": true,
    "statParam": true,
    "ignoreParams": [],
  })
}
