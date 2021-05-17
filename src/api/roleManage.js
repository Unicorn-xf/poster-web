import axios from '@/libs/api.request'

export const getAllRole = (data) => {
  return axios.request({
    url: '/sysRole/getAllRole',
    method: 'post',
    data: data
  })
}

export const getMenuTree = (data) => {
  return axios.request({
    url: '/sysMenuFun/getAllMenuTree',
    method: 'post',
    data: data
  })
}

export const modifyRoleMenu = (data) => {
  return axios.request({
    url: '/sysRole/modifyRoleMenu',
    method: 'post',
    data: data
  })
}

export const addRole = (data) => {
  return axios.request({
    url: '/sysRole/addRole',
    method: 'post',
    data: data
  })
}

export const delRoleById = (data) => {
  return axios.request({
    url: '/sysRole/delRoleById',
    method: 'post',
    data: data
  })
}

export const modifyRoleById = (data) => {
  return axios.request({
    url: '/sysRole/modifyRoleById',
    method: 'post',
    data: data
  })
}
