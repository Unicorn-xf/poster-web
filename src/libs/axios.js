import axios from 'axios'
import store from '@/store'
import { setToken, getToken, setCookiesValue, getCookiesValue } from '@/libs/util'
import router from '@/router'
// import { Spin } from 'iview'
const addErrorLog = errorInfo => {
  const { statusText, status, request: { responseURL } } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
   let headers = {}
   if((getToken())){
    //设置请求头信息
    headers = {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json',
    }
   }
    const config = {
      baseURL: this.baseUrl,
      headers: headers
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      // 处理token失效问题
      // USER_NEED_AUTHORITIES(2001,"用户未登录")
      if(res.data && res.data.code === 2001){
        if(getCookiesValue("isLoginPage") !== "true"){
          setCookiesValue("isLoginPage","true")
          alert("登录失效！请重新登录！")
          store.dispatch('setUserInfoNull')
          router.push({
            name: "login"
          })
        }
      }
      return { data, status }
    }, error => {
      alert(error)
      this.destroy(url)
      let errorInfo = error.response
      if (!errorInfo) {
        const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
        errorInfo = {
          statusText,
          status,
          request: { responseURL: config.url }
        }
      }
      addErrorLog(errorInfo)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
