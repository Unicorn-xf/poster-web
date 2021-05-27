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
  data.method = 'modifyRoleMenu'
  return axios.request({
    url: '/http/roleInfo',
    method: 'post',
    data: data
  })
}

export const addRole = (data) => {
  let list = {}
  list.method = 'addRole'
  list.info = data
  return axios.request({
    url: '/http/roleInfo',
    method: 'post',
    data: list
  })
}

export const delRoleById = (data) => {
  data.method = 'delRoleById'
  return axios.request({
    url: '/http/roleInfo',
    method: 'post',
    data: data
  })
}

export const modifyRoleById = (data) => {
  let list = {}
  list.method = 'modifyRoleById'
  list.info = data
  return axios.request({
    url: '/http/roleInfo',
    method: 'post',
    data: list
  })
}
