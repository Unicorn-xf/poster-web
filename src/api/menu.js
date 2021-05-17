import axios from '@/libs/api.request'

// 获取动态菜单
export const findMenu = data => {
  return axios.request({
    url: 'sysMenuFun/findMenu',
    method: 'post',
    data: data
  })
}
// 获取全部菜单
export const getAllPermissionList = params => {
  return axios.request({
    // url: 'sysMenuFun/getMenuAllList',
    url: 'sysMenuFun/getAllMenuTree',
    method: 'post',
    data: params
  })
}
// 添加菜单
export const addMenu = params => {
  return axios.request({
    url: 'sysMenuFun/addMenu',
    method: 'post',
    data: params
  })
}
// 编辑菜单
export const editMenu = params => {
  return axios.request({
    url: 'sysMenuFun/editMenu',
    method: 'post',
    data: params
  })
}
// 删除菜单
export const delMenuByIds = params => {
  return axios.request({
    url: 'sysMenuFun/delMenuByIds',
    method: 'post',
    data: params
  })
}
// 搜索菜单
export const searchMenu = params => {
  return axios.request({
    url: 'sysMenuFun/searchMenu',
    method: 'post',
    data: params
  })
}
// 通过类型获取字典数据
export const getDictDataByType = (type, params) => {
  return axios.request({
      url: `/dictData/getByType/${type}`,
      method: 'post',
      data: params
    })
}
