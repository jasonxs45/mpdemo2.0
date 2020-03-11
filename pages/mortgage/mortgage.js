import MComponent from '../../common/MComponent.js'
import { formatNumber } from '../../utils/util'
const ratesName = [
  ['基准利率（4.9%）', '基准利率7折（3.43%）', '基准利率75折（3.68%）', '基准利率8折（3.92%）', '基准利率85折（4.17%）', '基准利率9折（4.41%）', '基准利率95折（4.66%）', '基准利率1.05倍（5.15%）', '基准利率1.1倍（5.39%）', '基准利率1.2倍（5.88%）', '基准利率1.3倍（6.37%）'],
  ['基准利率（3.25%）', '基准利率7折（2.27%）', '基准利率75折（2.44%）', '基准利率8折（2.60%）', '基准利率85折（2.76%）', '基准利率9折（2.93%）', '基准利率95折（3.09%）', '基准利率1.05倍（3.41%）', '基准利率1.1倍（3.58%）', '基准利率1.2倍（3.90%）', '基准利率1.3倍（4.23%）']
]
const rates = [
  [0.049, 0.034, 0.0368, 0.0392, 0.0417, 0.0441, 0.0466, 0.0515, 0.0539, 0.0588, 0.0637],
  [0.0325, 0.0227, 0.0244, 0.026, 0.0276, 0.0293, 0.0309, 0.0341, 0.0358, 0.039, 0.0423]
]
MComponent({
  data: {
    commercialTotal: 1000000,
    gjjTotal: 500000,
    tabs: ["商业贷款", "公积金贷款", "组合贷款"],
    activeIndex: 0,
    loansType: ['按房价总额', '按贷款总额'],
    loanIndex: 0,
    ratesName,
    rates,
    rateIndex0: 0,
    rateIndex1: 0,
    percentArr: [8, 7, 6, 5, 4, 3, 2],
    percentIndex: 0,
    years: [30, 25, 20, 15, 10],
    yearIndex: 0
  },
  computed: {
    showCommercial() {
      const { commercialTotal } = this.data
      return formatNumber(commercialTotal, 2)
    },
    showGjj() {
      const { gjjTotal } = this.data
      return formatNumber(gjjTotal, 2)
    }
  },
  methods: {
    showDetail() {
      const {
        loanIndex,
        activeIndex,
        commercialTotal,
        percentArr,
        percentIndex,
        gjjTotal,
        rates,
        rateIndex0,
        rateIndex1,
        years,
        yearIndex
      } = this.data
      let _commercialTotal,
      _gjjTotal,
      _interestRatePerMou0,
      _interestRatePerMou1,
      _totalMouths
      _commercialTotal = loanIndex == 1 || activeIndex == 2 ? commercialTotal : commercialTotal * percentArr[percentIndex] / 10
      _gjjTotal = loanIndex == 1 || activeIndex == 2 ? gjjTotal : gjjTotal * percentArr[percentIndex] / 10
      _interestRatePerMou0 = rates[0][rateIndex0]
      _interestRatePerMou1 = rates[1][rateIndex1]
      _totalMouths = years[yearIndex] * 12
      console.log(_commercialTotal, _gjjTotal, _interestRatePerMou0, _interestRatePerMou1, _totalMouths)
      wx.navigateTo({
        url: './detail?parentActiveIndex=' + activeIndex + '&commercialTotal=' + _commercialTotal + '&gjjTotal=' + _gjjTotal + '&interestRatePerMou0=' + _interestRatePerMou0 + '&interestRatePerMou1=' + _interestRatePerMou1 + '&totalMouths=' + _totalMouths
      })
    },
    onChange(e) {
      const { attr } = e.currentTarget.dataset
      this.set({
        [attr]: e.detail.value
      })
    },
    onInput(e) {
      const { attr } = e.currentTarget.dataset
      // this.data[attr] = e.detail.value
    },
    onBlur(e) {
      const { attr } = e.currentTarget.dataset
      const { value } = e.detail
      this.data[attr] = Number(value.replace(/,/g, ''))
      this.set({
        [attr]: this.data[attr]
      })
    },
    onLoad() { }
  }
}, true)