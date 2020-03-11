const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
// 电话号码
const checkPhone = phone => {
  let reg = /^1[3456789]\d{9}$/;
  if (reg.test(phone)) {
    return true
  } else {
    return false
  }
}
// 中文姓名2-6
const checkName = name => {
  let reg = /^[\u4E00-\u9FA5]{2,6}$/;
  if (reg.test(name)) {
    return true
  } else {
    return false
  }
}
const checkName2 = name => {
  let reg = name.replace(/\s*/g, "")
  if (reg.length > 0) {
    return true
  } else {
    return false
  }
}
// 邮编
const checkPostal = text => {
  let reg = /^[0-9]{6}$/;
  if (reg.test(text)) {
    return true
  } else {
    return false
  }
}
// 拨打电话号码
const calling = phone => {
  wx.makePhoneCall({
    phoneNumber: phone,
    success: function () {
      console.log("拨打电话成功！")
    },
    fail: function () {
      console.log("拨打电话失败！")
    }
  })
}
// 邮箱
const checkEmail = text => {
  var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式
  if (text === "") { //输入不能为空
    wx.showToast({ title: "请填写电子邮箱", icon: 'none', duration: 2000 });
    return false;
  } else if (!reg.test(text)) { //正则验证不通过，格式不对
    wx.showToast({ title: "电子邮箱格式不对", icon: 'none', duration: 2000 });
    return false;
  } else {
    return true;
  }
}
// 身份证验证
const checkIdCard = code => {
  var city = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江 ",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北 ",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏 ",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外 "
  };
  var tip = "";
  var pass = true;
  if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
    tip = "身份证号格式错误";
    pass = false;

  } else if (!city[code.substr(0, 2)]) {
    tip = "地址编码错误";
    pass = false;

  } else {
    //18位身份证需要验证最后一位校验位
    if (code.length == 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != code[17]) {
        tip = "校验位错误";
        pass = false;

      }
    }
  }
  if (!pass) console.log(tip);
  return pass;
}
module.exports = {
  formatTime: formatTime,
  checkPhone: checkPhone,
  checkName: checkName,
  checkName2: checkName2,
  checkPostal: checkPostal,
  checkEmail: checkEmail,
  calling: calling,
  checkIdCard: checkIdCard
}