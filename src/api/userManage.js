import axios from '@/libs/api.request'


export const getUserInfos = data => {
  return axios.request({
    url: 'sysadmin/getUserInfo',
    params: data,
    method: 'post'
  })
}

export const disableUser = data => {
  return axios.request({
    url: 'sysadmin/disableOrEnableUser',
    params: data,
    method: 'post'
  })
}

export const enableUser = data => {
  return axios.request({
    url: 'sysadmin/disableOrEnableUser',
    params: data,
    method: 'post'
  })
}

export const deleteUser = data => {
  return axios.request({
    url: 'sysadmin/deleteUser',
    params: data,
    method: 'post'
  })
}

export const resetUser = data => {
  return axios.request({
    url: 'sysadmin/resetUser',
    params: data,
    method: 'post'
  })
}

export const getRoleList = data => {
  return axios.request({
    url: 'sysRole/getAllRole',
    data: data,
    method: 'post'
  })
}

export const getDeptList = data => {
  return axios.request({
    url: 'sysDept/getDeptInfo',
    data: data,
    method: 'post'
  })
}

export const addUser = data => {
  return axios.request({
    url: 'sysadmin/addUser',
    data: data,
    method: 'post'
  })
}

export const editUser = data => {
  return axios.request({
    url: 'sysadmin/editUser',
    data: data,
    method: 'post'
  })
}
