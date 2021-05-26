import parentView from '@/components/parent-view'
import {
	hasChild,
	localRead
} from '@/libs/util'
import store from '@/store'
import Main from '@/components/main'
import {
	forEach
} from '@/libs/tools'

// 加载菜单
export const loadMenu = () => {
	let list = []
	let data = localRead('route')
  //console.info("加载菜单："+JSON.stringify(data))
	if (data === 'null' || !data) {
		return list
	}
  //console.info("加载菜单1："+JSON.parse(data))
	list = makeMenu(JSON.parse(data))
  //console.info("加载菜单2："+JSON.stringify(list))
	return list
}

// 格式化菜单
// export const formatMenu = (list) => {
// 	let res = []
// 	forEach(list, item => {
//     // console.log("item: " + JSON.stringify(item.name));
// 		let obj = {
// 			path: item.path,
// 			name: item.name
// 		}
// 		obj.meta = item.meta
// 		if (item.parentid === 0) {
// 			obj.component = Main
// 		} else {
// 			let data = item.component
// 			// 这里的data应为 /notice/notice.vue 类似的数据，对应的是src/view/下的本地文件
// 			obj.component = () => import('@/view' + data)
// 		}
// 		if (hasChild(item)) {
// 			obj.children = formatMenu(item.children)
// 		}
// 		res.push(obj)
// 	})
// 	return res
// }

/**
 * 格式化菜单项生成树状结构
 */
export const makeMenu = (menuList) => {
  let menuTreeList = []
  for (var i = 0; i < menuList.length; i++) {
    if(menuList[i].menuPid == '0'){// 处理main
      let menuItem = {
        'path': menuList[i].menuPath,
        'name': menuList[i].routeName,
        'component': Main,
        'meta': {
          'icon': menuList[i].icon,
          'title': menuList[i].menuName
        },
        // 'parentid': 0
      }
      if(getParent(menuList[i].id).length >0 ){
        let children = []
        menuItem.children = children
        makeTree(menuList[i].id,children)
      }
      if(menuList[i].hideMenu === 1){
        menuItem.meta.hideInMenu = true
      }
      if(menuList[i].notCache === 1){
        menuItem.meta.notCache = true
      }
      if(menuList[i].hideBread === 1){
        menuItem.meta.hideBread = true
      }
      menuTreeList.push(menuItem)
    }
  }
  return menuTreeList
  function makeTree(id,children) {
    var topMenu = getParent(id)
    if (topMenu.length > 0) {
      for (var i in topMenu) {
        let menuItem2 = {
          path: topMenu[i].menuPath,
          name: topMenu[i].routeName,
          meta: {
            icon: topMenu[i].icon,
            title: topMenu[i].menuName
          }
        }
        if(topMenu[i].component === "parentView"){
          menuItem2.component = parentView
        }else{
          let component = topMenu[i].component
          menuItem2.component = () => import('@/view'+component)
        }
        if(getParent(topMenu[i].id).length >0 ){
          let children2 = []
          menuItem2.children = children2
          makeTree(topMenu[i].id,children2)
        }
        if(topMenu[i].hideMenu === 1){
          menuItem2.meta.hideInMenu = true
        }
        if(topMenu[i].notCache === 1){
          menuItem2.meta.notCache = true
        }
        if(topMenu[i].hideBread === 1){
          menuItem2.meta.hideBread = true
        }
        children.push(menuItem2)
      }
    }
  }

  function getParent(id) {
    var aParent = []
    for (var i in menuList) {
      if (menuList[i].menuPid == id) {
        aParent.push(menuList[i])
      }
    }
    return aParent
  }
}
