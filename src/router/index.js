import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import {
  setToken,
  getToken,
  setPhone,
  getPhone,
  setTitle,
  localSave,
  localRead,
  canTurnToNoAccess,
  getCookiesValue
} from '@/libs/util'
import config from '@/config'
const {
  homeName
} = config
// 引入加载菜单
import {
  loadMenu,
  // formatMenu,
  makeMenu
} from '@/libs/router-util'

import {
  findMenu // 这里是封装的后台返回菜单数据的接口，方法名称根据实际情况改变
} from '@/api/menu'

Vue.use(Router)
const router = new Router({
  routes: [...routes, ...loadMenu()],
  mode: 'history'
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, next) => {
  if (canTurnToNoAccess(to.name, router.options.routes)) next() // 有权限，可访问
  else next({
    replace: true,
    name: 'error_404'
  }) // 强制跳转，重定向到404页面  无权限，重定向到401页面
}

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  const phone = getPhone()
  const menu = localRead('route') // 读取路由数据
  // 处理token失效和强制访问页面处理（强制访问页面不在查询出来的页面列表里）
  // if(){

  // }

  if (!phone && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME, // 跳转到登录页
    })
  } else if (!phone && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (phone && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    // 判断是否有用户信息缓存没有获取，有从缓存中获取
    let userId = getCookiesValue("userId")
    if(userId){
      // 存在用户信息
      store.dispatch('getUserInfoByCookie')
      if (localRead('hasGetInfo') === "true") {
        turnTo(to, next)
      }else{
        next()
      }
    }else{
      store.dispatch('getUserInfoAndSet').then(user => {
        // 如果本地不存在路由数据则动态获取
        //console.info("用户数据："+JSON.stringify(user))
        if (menu === "null" || !menu || menu.length === 0) {
          findMenu({
            userId: user.data[0]._id
          }).then(res => {
            var list = []
            var menuData = res.data.data
            // console.log('返回的路由原始数据:'+ JSON.stringify(menuData))

            // 格式化菜单
            // list = formatMenu(menuData)
            localSave('route', JSON.stringify(menuData))
            list = makeMenu(menuData)
            // console.log('格式化路由数据:')
            // 将404路由动态注入，防止第一次没有路由数据跳转到404,
            list.push({
              path: '/404',
              name: 'error_404',
              meta: {
                hideInMenu: true
              },
              component: () => import('@/view/error-page/404.vue')
            })
            router.options.routes = router.options.routes.concat(list)
            // 刷新界面菜单
            store.commit('updateMenuList', list)
            // store.state.user.hasGetInfo = true
            localSave('hasGetInfo', "true")
            next({
              name: homeName // 跳转到homeName页
            })
          })
        } else {
          if (localRead('hasGetInfo') === "true") {
            turnTo(to, next)
          }else{
            next()
          }
        }
      }).catch(() => {
        setToken('')
        next({
          name: 'login'
        })
      })
    }
  }
})

router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
