import MComponent from '../../common/MComponent'
import { _detail } from '../../api/projects'
const arr = ['城市区域', '项目名称', '项目别名', '占地面积(㎡)', '建筑面积(㎡)', '容积率', '开盘时间', '预售许可证', '最新开盘', '交付时间', '物业公司', '物业类型', '物业费', '供电方式', '供热方式', '供水方式', '楼盘地址', '销售地址', '规划户数', '车位匹配', '咨询电话', '楼盘标签']
const app = getApp()
MComponent({
  data: {
    detail: null,
    list: []
  },
  computed: {
    showList() {
      const { detail } = this.data
      let project = detail ? detail.Project : {}
      let arr = [
        ['城市区域', project.CityName + project.AreaName ],
        ['项目名称', project.ProjectName ],
        ['项目别名', project.ProjectAlias ],
        ['占地面积(㎡)', project.ProjectFloorArea ],
        // ['建筑面积(㎡)', undefined],
        ['容积率', project.Volume ],
        ['开盘时间', project.OpenTime ],
        ['预售许可证', project.Permit ],
        ['最新开盘', project.NewOpen ],
        ['交付时间', project.Delivery ],
        ['物业公司', project.PropertyCompany ],
        ['物业类型', project.PropertyType ],
        ['物业费', project.PropertyCharges ],
        ['供电方式', project.PowerSupply ],
        ['供热方式', project.HotSupply ],
        ['供水方式', project.WaterSupply ],
        ['楼盘地址', project.ProjectAddress ],
        ['销售地址', project.SaleAddress ],
        ['规划户数', project.ResidenceNum ],
        ['车位匹配', project.Parking ],
        ['咨询电话', project.Phone ],
        ['楼盘标签', project.TagList ? JSON.parse(project.TagList).join('、'): '' ]
      ]
      return arr
    }
  },
  methods: {
    getDetail() {
      const { id: ID } = this.data
      wx.showNavigationBarLoading()
      app.loading('加载中')
      _detail({ ID })
        .then(res => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
          const { code, msg, data } = res.data
          if (code === 0) {
            this.set({
              detail: data
            })
          } else {
            wx.showModal({
              title: '对不起',
              content: msg,
              showCancel: false
            })
          }
        })
        .catch(err => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
          wx.showModal({
            title: '对不起',
            content: JSON.stringify(err),
            showCancel: false
          })
        })
    },
    onLoad(opt) {
      const { id } = opt
      this.set({
        id
      })
      this.getDetail()
    }
  }
}, true)