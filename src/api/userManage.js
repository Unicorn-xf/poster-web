import axios from '@/libs/api.request'


export const getUserInfos = data => {
  let list = {}
  list.method = "getUserInfosByAll"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    method: 'post',
    data: list
  })
}

export const disableUser = data => {
  let list = {}
  list.method = "disableUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}

export const enableUser = data => {
  let list = {}
  list.method = "enableUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}

export const deleteUser = data => {
  let list = {}
  list.method = "deleteUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}

export const resetUser = data => {
  let list = {}
  list.method = "resetUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}

export const getRoleList = data => {
 data.method = 'getAllRole'
 return axios.request({
   url: '/http/roleInfo',
   method: 'post',
   data: data
 })
}

export const getDeptList = data => {
  let list = {}
  list.method = "getDeptList"
  list.info = data
  return axios.request({
    url: '/http/deptInfo',
    method: 'post',
    data: list
  })
}

export const addUser = data => {
  let list = {}
  list.method = "addUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}

export const editUser = data => {
  let list = {}
  list.method = "editUser"
  list.info = data
  return axios.request({
    url: '/http/userInfo',
    data: list,
    method: 'post'
  })
}
