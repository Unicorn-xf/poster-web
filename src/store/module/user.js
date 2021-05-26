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
import { setToken, getToken, setCookiesValue, getCookiesValue, localSave,setPhone,getPhone } from '@/libs/util'

export default {
  state: {
    userName: '',
    userId: '',
    phone:getPhone(),
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
    setPhone (state, phone) {
      state.phone = phone
      setPhone(phone)
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
        const data = res.data.data[0];
        commit('setPhone', data.phoneNum)
        resolve()
      })
    },


    // 退出登录
    handleLogOut ({ state, commit }) {
       return new Promise((resolve, reject) => {
      //   logout(state.token).then(() => {
      //     commit('setToken', '')
      //     commit('setAccess', [])
      //     resolve()
      //   }).catch(err => {
      //     reject(err)
      //   })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        commit('setPhone', '')
        commit('setToken', '')
        commit('setAccess', [])
        resolve()
      })
    },
    // 从Cookie获取用户相关信息
    getUserInfoByCookie ({state, commit }) {
      commit('setAvatar', getCookiesValue("avatar"))
      commit('setUserName', getCookiesValue("userName"))
      commit('setUserId', getCookiesValue("userId"))
      commit('setPhone', getCookiesValue("phone"))
      //commit('setAccess', getCookiesValue("access"))
      //commit('setHasGetInfo', true)
    },
    setUserInfoNull () {
      localSave('route', "null")
      localSave('hasGetInfo', "false")
      setCookiesValue("avatar", "")
      setCookiesValue("userId", "")
      setCookiesValue("userName", "")
      setCookiesValue("hasGetInfo", "")
      setCookiesValue("access", "")
      setCookiesValue("phone", "")
      setToken("")
    },
    // 获取用户相关信息并存入cookie
    getUserInfoAndSet ({state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          //console.log('state.phone111:'+state.phone);
          getUserInfo(state.phone).then(res => {
            const data = res.data
            if(res.data.retcode === '0000'){
              commit('setAvatar', data.data[0].avatar)
              commit('setUserName', data.data[0].userName)
              commit('setUserId', data.data[0]._id)
              commit('setPhone', data.data[0].phoneNum)
             // commit('setAccess', data.data.access)
              //commit('setHasGetInfo', true)
              setCookiesValue("avatar", data.data[0].avatar)
              setCookiesValue("userId", data.data[0]._id)
              setCookiesValue("userName", data.data[0].userName)
              setCookiesValue("phone", data.data[0].phoneNum)
              //setCookiesValue("access", data.data.access)
              //setCookiesValue("hasGetInfo", true)
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
          //console.log('state.phone222:'+state.phone);
          getUserInfo(state.phone).then(res => {
            const data = res.data
            if(res.data.retcode === '0000'){
              commit('setAvatar', data.data[0].avatar)
              commit('setUserName', data.data[0].userName)
              commit('setUserId', data.data[0]._id)
              commit('setPhone', data.data[0].phoneNum)
              //commit('setAccess', data.data.access)
              //commit('setHasGetInfo', true)
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
