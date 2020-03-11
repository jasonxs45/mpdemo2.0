import calculate from "./calculatorForHouseLoan"
import MComponent from '../../common/MComponent'
import { formatNumber } from '../../utils/util'
const app = getApp()
MComponent({
  data: {
    currentLength: 20,
    totalCount: 0,
    tabs: ["等额本息", "等额本金", "本息/本金"],
    activeIndex: 0,
    hiddenDetail: true,
    parentActiveIndex: 0,
    commercialTotal: 0,
    gjjTotal: 0,
    interestRatePerMou0: 0,
    interestRatePerMou1: 0,
    totalMouths: 0,
    loanTotal: 0, //贷款总额
    totalInterestAi: 0, //等额本息总还款利息
    totalRepayAi: 0, //总还本带息
    repayPerMouAi: 0, //等额本息月均还本带息
    totalInterestAp: 0, //等额本金总还款利息
    totalRepayPriceAp: 0, //等额本金总还款金额
    //等额本金第一个月还款
    repayPerMouthAp: 0,
    //之后每个月递减额
    decreasePerMouAp: 0,
    //等额本息详情
    repayPerMouObjAi: {},
    //等额本金详情
    repayPerMouObjAp: {}
  },
  computed: {
    finished() {
      const { currentLength, repayPerMouObjAi } = this.data
      const { balanceArrAi } = repayPerMouObjAi
      return balanceArrAi ? currentLength >= balanceArrAi.length : true
    }
  },
  methods: {
    onChange(e) {
      const { attr } = e.currentTarget.dataset
      this.setData({
        [attr]: e.detail.value,
        currentLength: 20
      })
    },
    showDetail() {
      this.data.hiddenDetail = !this.data.hiddenDetail;
      this.setData({
        hiddenDetail: this.data.hiddenDetail
      });
    },
    loadMore() {
      console.log('load more')
      const { currentLength } = this.data
      this.set({
        currentLength: currentLength + 20
      })
    },
    onLoad(e) {
      app.loading('数据加载中...')
      let detail;
      if (e.parentActiveIndex == 0) {
        detail = calculate(+e.commercialTotal, +e.interestRatePerMou0 / 12, +e.totalMouths);
        for (let key in detail) {
          if (detail.hasOwnProperty(key)) {
            if (typeof detail[key] === "string") {
              detail[key] = formatNumber((+detail[key]), 2);
            }
            else {
              for (let arr in detail[key]) {
                if (detail[key].hasOwnProperty(arr)) {
                  for (let i = 0; i < detail[key][arr].length; i++) {
                    detail[key][arr][i] = formatNumber((+detail[key][arr][i]), 2);
                  }
                }
              }
            }
          }
        }
      } else if (e.parentActiveIndex == 1) {
        detail = calculate(+e.gjjTotal, +e.interestRatePerMou1 / 12, +e.totalMouths);
        for (let key in detail) {
          if (detail.hasOwnProperty(key)) {
            if (typeof detail[key] === "string") {
              detail[key] = formatNumber((+detail[key]), 2);
            }
            else {
              for (let arr in detail[key]) {
                if (detail[key].hasOwnProperty(arr)) {
                  for (let i = 0; i < detail[key][arr].length; i++) {
                    detail[key][arr][i] = formatNumber((+detail[key][arr][i]), 2);
                  }
                }
              }
            }
          }
        }
      } else {
        var tmp = calculate(+e.commercialTotal, +e.interestRatePerMou0 / 12, +e.totalMouths);
        detail = calculate(+e.gjjTotal, +e.interestRatePerMou1 / 12, +e.totalMouths);
        console.log(detail)
        for (let key in detail) {
          if (detail.hasOwnProperty(key)) {
            if (typeof detail[key] === "string") {
              detail[key] = formatNumber((+detail[key] + +tmp[key]), 2);
            }
            else {
              for (let arr in detail[key]) {
                if (detail[key].hasOwnProperty(arr)) {
                  for (let i = 0; i < detail[key][arr].length; i++) {
                    detail[key][arr][i] = formatNumber((+detail[key][arr][i] + +tmp[key][arr][i]), 2);
                  }
                }
              }
            }
          }
        }
      }
      this.set({ ...e, ...detail })
        .then(() => {
          wx.hideLoading()
        })
    },
    onReachBottom() {
      const { finished, hiddenDetail } = this.data
      if (hiddenDetail || finished) {
        return
      }
      this.loadMore()
    }
  }
}, true)