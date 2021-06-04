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
  let data = {}
  data.method = "getByParentId"
  data.info = params
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: data
  })
}
// 添加部门
export const addDepartment = (params) => {
  let data = {}
  data.method = "addDepartment"
  data.info = params
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: data
  })
}
// 编辑部门
export const editDepartment = (params) => {
  let data = {}
  data.method = "editDepartment"
  data.info = params
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: data
  })
}
// 删除部门
export const deleteDepartment = (params) => {
  let data = {}
  data.method = "deleteDepartment"
  data.info = params
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: data
  })
}
// 搜索部门
export const searchDepartment = (params) => {
  let data = {}
  data.method = "searchDepartment"
  data.info = params
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: data
  })
}
