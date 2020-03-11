import { fetch, post } from './index'
/**================================
 *           项目模块
 ================================*/
//  获取是否定位的配置
export const _locate = () => fetch({
  action: "GetProjectShowType"
})
//  获取项目城市列表
export const _citylist = () => fetch({
  action: "GetCityList"
})
//  获取项目区域列表
export const _arealist = CityID => fetch({
  action: "GetAreaList",
  CityID
})
// 获取筛选条件
export const _filterlist = CityID => fetch({
  action: "GetProjectPagerOption",
  CityID
})
//  查询项目列表
export const _projectlist =
  ({
    PageIndex,
    PageSize = 10,
    AreaID,
    ProjectName,
    ProjectTypeList,
    TagList,
    TotalPrice,
    CityID
  }) =>
    post({
      action: 'GetProjectPager',
      PageIndex,
      PageSize,
      Where: JSON.stringify({
        CityID,
        AreaID,
        ProjectName,
        ProjectTypeList,
        TagList,
        TotalPrice
      })
    })
// 获取项目详情
export const _detail = ({ ID, UnionID = '' }) => fetch({
  action: 'GetProjectInfo',
  ID,
  UnionID
})
// 查询是否有过绑定置业顾问
export const _checkConsult = ({ ProjectID, UnionID }) => fetch({
  action: 'IsBindFriendOnProject',
  ProjectID,
  UnionID
})
// 查询户型详情
export const _housetypedetail = ({ ID }) => fetch({
  action: 'GetProjectHuXingInfo',
  ID
})
// 查询项目周边
export const _getsurrounding = ID => fetch({
  action: 'GetProjectSupport',
  ID
})
// 预约
export const _appoint = ({ ProjectID, UnionID, Name, Tel, AppointTime, ConsultantID = '' }) => fetch({
  action: 'Appoint',
  ProjectID,
  UnionID,
  Name,
  Tel,
  AppointTime,
  ConsultantID
})
// 用户预约列表
export const _appointrecord = ({ UnionID, PageIndex, PageSize}) => fetch({
  action: 'GetMyAppointment',
  UnionID,
  PageIndex,
  PageSize
})
// 生成海报
// action：GetShareImg
// UnionID：用户粉丝ID
// ObjectID：收藏项目ID
// Type：海报类型：Project项目、HuXing户型、News新闻  Active活动
export const _getposter = ({ UnionID, ObjectID, Type }) => fetch({
  action: 'CreateShareImg',
  UnionID,
  ObjectID,
  Type
})
// 增加分享次数
export const _addshare = ({
  ShareUnionID,
  UnionID,
  ObjectID,
  Type
}) => fetch({
  action: 'VisitObjectByShareUnionID',
  ShareUnionID,
  UnionID,
  ObjectID,
  Type
})