import axios from '@/libs/api.request'

// 获取一级部门
// export const initDepartment = (params) => {
//   console.log("!!!!!!!");
//   return axios.request({
//     url: 'sysDept/getByParentId',
//     method: 'post',
//     data: params
//   })
// }
// 加载部门子级数据
export const loadDepartment = (params) => {
  return axios.request({
    url: 'sysDept/getByParentId',
    method: 'post',
    data: params
  })
}
// 添加部门
export const addDepartment = (params) => {
  return axios.request({
    url: 'sysDept/add',
    method: 'post',
    data: params
  })
}
// 编辑部门
export const editDepartment = (params) => {
  return axios.request({
    url: 'sysDept/edit',
    method: 'post',
    data: params
  })
}
// 删除部门
export const deleteDepartment = (params) => {
  return axios.request({
    url: 'sysDept/delByIds',
    method: 'post',
    data: params
  })
}
// 搜索部门
export const searchDepartment = (params) => {
  return axios.request({
    url: 'sysDept/search',
    method: 'post',
    data: params
  })
}
