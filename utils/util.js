function isDef(value) {
  return value !== undefined && value !== null
}
function isObj(x) {
  const type = typeof x;
  return x !== null && (type === 'object' || type === 'function')
}
function isNumber(value) {
  return /^\d+$/.test(value)
}
function range(num, min, max) {
  return Math.min(Math.max(num, min), max)
}
function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1 ? str : padLeftZero(str)))
    }
  }
  return fmt
}
function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}
function transferWeek(n) {
  let txt = ''
  switch (n) {
    case 0:
      txt = '日'
      break
    case 1:
      txt = '一'
      break
    case 2:
      txt = '二'
      break
    case 3:
      txt = '三'
      break
    case 4:
      txt = '四'
      break
    case 5:
      txt = '五'
      break
    case 6:
      txt = '六'
      break
  }
  return txt
}
function formatNumber(num, cent, isThousand = true) {
  num = num.toString().replace(/\$|\,/g, '')
  // 检查传入数值为数值类型
  if (isNaN(num)) {
    num = 0
  }
  // 获取符号(正/负数)
  let abs = Number(Math.abs(num))
  let sign = Number(num) === abs
  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001) // 把指定的小数位先转换成整数.多余的小数位四舍五入
  let cents = num % Math.pow(10, cent) // 求出小数位数值
  num = Math.floor(num / Math.pow(10, cent)).toString() // 求出整数位数值
  cents = cents.toString()// 把小数位转换成字符串,以便求小数位长度

  // 补足小数位到指定的位数
  while (cents.length < cent) {
    cents = '0' + cents
  }
  if (isThousand) {
    // 对整数部分进行千分位格式化.
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3))
    }
  }
  if (cent > 0) {
    return (((sign) ? '' : '-') + num + '.' + cents)
  } else {
    return (((sign) ? '' : '-') + num)
  }
}
function toast(msg) {
  wx.showToast({
    title: msg,
    icon: 'none'
  })
}
function loading(msg) {
  wx.showLoading({
    title: msg,
    mask: true
  })
}
export {
  isObj,
  isDef,
  isNumber,
  range,
  formatDate,
  transferWeek,
  formatNumber,
  toast,
  loading
}
