import {
  login,
  logout,
  getUserInfo,
  getMessage,
  getContentByMsgId,
  hasRead,
  removeReaded,
  restoreTrash,
  getUnreadCount
} from '@/api/user'
import { setToken, getToken, setCookiesValue, getCookiesValue, localSave } from '@/libs/util'

export default {
  state: {
    userName: '',
    userId: '',
    avatarImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
    unreadCount: 0,
    messageUnreadList: [],
    messageReadedList: [],
    messageTrashList: [],
    messageContentStore: {}
  },
  mutations: {
    setAvatar (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setMessageCount (state, count) {
      state.unreadCount = count
    },
    setMessageUnreadList (state, list) {
      state.messageUnreadList = list
    },
    setMessageReadedList (state, list) {
      state.messageReadedList = list
    },
    setMessageTrashList (state, list) {
      state.messageTrashList = list
    },
    updateMessageContentStore (state, { msg_id, content }) {
      state.messageContentStore[msg_id] = content
    },
    moveMsg (state, { from, to, msg_id }) {
      const index = state[from].findIndex(_ => _.msg_id === msg_id)
      const msgItem = state[from].splice(index, 1)[0]
      msgItem.loading = false
      state[to].unshift(msgItem)
    }
  },
  getters: {
    messageUnreadCount: state => state.messageUnreadList.length,
    messageReadedCount: state => state.messageReadedList.length,
    messageTrashCount: state => state.messageTrashList.length
  },
  actions: {
    // 登录
    handleLogin ({ commit }, {res}) {
      return new Promise((resolve, reject) => {
        const data = res.data;
        commit('setToken', data.jwtToken)
        resolve()
      })
    },

    // 登录
    // handleLogin ({ commit }, { username, password }) {
    //   username = username.trim()
    //   return new Promise((resolve, reject) => {
    //     login({
    //       username,
    //       password
    //     }).then(res => {
    //       console.log("res: " + JSON.stringify(res));
    //       const data = res.data
    //       commit('setToken', data.token)
    //       resolve()
    //     }).catch(err => {
    //       reject(err)
    //     })
    //   })
    // },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          resolve()
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 从Cookie获取用户相关信息
    getUserInfoByCookie ({state, commit }) {
      commit('setAvatar', getCookiesValue("avatar"))
      commit('setUserName', getCookiesValue("userName"))
      commit('setUserId', getCookiesValue("userId"))
      commit('setAccess', getCookiesValue("access"))
      commit('setHasGetInfo', true)
    },
    setUserInfoNull () {
      localSave('route', "null")
      localSave('hasGetInfo', "false")
      setCookiesValue("avatar", "")
      setCookiesValue("userId", "")
      setCookiesValue("userName", "")
      setCookiesValue("access", "")
      setCookiesValue("hasGetInfo", "")
      setToken("")
    },
    // 获取用户相关信息并存入cookie
    getUserInfoAndSet ({state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          // console.log('state.token:'+state.token);
          getUserInfo(state.token).then(res => {
            const data = res.data
            if(data.code === 1000){
              commit('setAvatar', data.data.avatar)
              commit('setUserName', data.data.userName)
              commit('setUserId', data.data.id)
              commit('setAccess', data.data.access)
              commit('setHasGetInfo', true)
              setCookiesValue("avatar", data.data.avatar)
              setCookiesValue("userId", data.data.id)
              setCookiesValue("userName", data.data.userName)
              setCookiesValue("access", data.data.access)
              setCookiesValue("hasGetInfo", true)
            }
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 获取用户相关信息
    getUserInfo ({state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          // console.log('state.token:'+state.token);
          getUserInfo(state.token).then(res => {
            const data = res.data
            if(data.code === 1000){
              commit('setAvatar', data.data.avatar)
              commit('setUserName', data.data.userName)
              commit('setUserId', data.data.id)
              commit('setAccess', data.data.access)
              commit('setHasGetInfo', true)
            }
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    // 此方法用来获取未读消息条数，接口只返回数值，不返回消息列表
    getUnreadMessageCount ({ state, commit }) {
      getUnreadCount().then(res => {
        const { data } = res
        commit('setMessageCount', data)
      })
    },
    // 获取消息列表，其中包含未读、已读、回收站三个列表
    getMessageList ({ state, commit }) {
      return new Promise((resolve, reject) => {
        getMessage().then(res => {
          const { unread, readed, trash } = res.data
          commit('setMessageUnreadList', unread.sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          commit('setMessageReadedList', readed.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          commit('setMessageTrashList', trash.map(_ => {
            _.loading = false
            return _
          }).sort((a, b) => new Date(b.create_time) - new Date(a.create_time)))
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 根据当前点击的消息的id获取内容
    getContentByMsgId ({ state, commit }, { msg_id }) {
      return new Promise((resolve, reject) => {
        let contentItem = state.messageContentStore[msg_id]
        if (contentItem) {
          resolve(contentItem)
        } else {
          getContentByMsgId(msg_id).then(res => {
            const content = res.data
            commit('updateMessageContentStore', { msg_id, content })
            resolve(content)
          })
        }
      })
    }
  }
}
