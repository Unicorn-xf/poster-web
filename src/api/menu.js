import axios from '@/libs/api.request'

// 获取动态菜单
export const findMenu = data => {
  data.method = 'findMenu'
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: data
  })
}
// 获取全部树形菜单
export const getAllPermissionList = params => {
  params.method = 'findMenuTree'
  return axios.request({
    // url: 'sysMenuFun/getMenuAllList',
    url: 'http/menuInfo',
    method: 'post',
    data: params
  })
}
// 添加菜单
export const addMenu = params => {
  let data = {}
  data.method = 'addMenu'
  data.info = params
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: data
  })
}
// 编辑菜单
export const editMenu = params => {
  let data = {}
  data.method = 'editMenu'
  data.info = params
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: data
  })
}
// 删除菜单
export const delMenuByIds = params => {
  let data = {}
  data.method = 'delMenuByIds'
  data.info = params
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: data
  })
}
// 搜索菜单
export const searchMenu = params => {
  let data = {}
  data.method = 'searchMenu'
  data.info = params
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: data
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
