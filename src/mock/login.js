import {
  getParams
} from '@/libs/util'

const USER_MAP = {
  super_admin: {
    name: 'super_admin',
    user_id: '1',
    access: ['super_admin', 'admin'],
    token: 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiLlvKDkuIkiLCJleHAiOjE2MDY0NjUwMTB9.TZZIhfC7fgtPuXyrdSyci_06A-3VtMgH6GWw_yRIU29enxGCmBxrchJUQAUjNtCKmu8ZpLmeAlhXavgUClnDogJVy5kUJtLy2TIb3pE4BkHxj4EOaYDf9hEGvQLW51HixEcm5H-Dm4EDG4_p2gmymK4Icgte80ZLk-yl5i5B_ls',
    // token: 'super_admin',
    avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  },
  admin: {
    name: 'admin',
    user_id: '2',
    access: ['admin'],
    token: 'admin',
    avatar: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
}

const MENU_LIST = {
  'data': [
    {
      'path': '/components',
      'name': 'components',
      'meta': {
        'icon': 'logo-buffer',
        'title': '组件'
      },
      'parentid': 0,
      'children': [{
          'path': 'tree_select_page',
          'name': 'tree_select_page',
          'meta': {
            'icon': 'md-arrow-dropdown-circle',
            'title': '树状下拉选择器'
          },
          'component': '/components/tree-select/index.vue'
        },
        {
          'path': 'count_to_page',
          'name': 'count_to_page',
          'meta': {
            'icon': 'md-trending-up',
            'title': '数字渐变'
          },
          'component': '/components/count-to/count-to.vue'
        }
      ]
    }
  ]
}

export const login = req => {
  req = JSON.parse(req.body)
  return {
    token: USER_MAP[req.userName].token
  }
}

export const getUserInfo = req => {
  const params = getParams(req.url)
  // return USER_MAP[params.token]
  // demo 先预设为super_admin
  return USER_MAP['super_admin']
}

export const logout = req => {
  return null
}

/* export const routeIndex = req => {
  return MENU_LIST
} */
