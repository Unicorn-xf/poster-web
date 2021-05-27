import axios from '@/libs/api.request'

export const getAllRole = (data) => {
  data.method = 'getAllRole'
  return axios.request({
    url: '/http/roleInfo',
    method: 'post',
    data: data
  })
}

export const getMenuTree = (data) => {
  let list = {}
  list.method = 'findMenuTree'
  return axios.request({
    url: 'http/menuInfo',
    method: 'post',
    data: list
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
