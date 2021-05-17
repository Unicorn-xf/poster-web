import store from '@/store'

const hasAuth = {
  install(Vue, options) {
    Vue.directive('hasAuth', {
      inserted(el, binding) {
        // 按钮权限控制的逻辑可以在这里调整
        // 通过当前按钮，获取所在权限组的组名
        // let permissGropName = binding.value.split("_")[0];
        // 通过登录成功后获取所有权限列表
        // 如下permissGroup类型，存到vuex，其中所有名字必须均唯一
        // let permissGroup = ["tables_delete", "tables_search", "count_view", "count_edit"]
        // console.log("access: " + JSON.stringify(store.state.user.access));
        let permissGroup = store.state.user.access;
        // 获取权限列表
        if (permissGroup.indexOf(binding.value) == -1) {
          // 两种方式都可以
          // el.style.display = "none"
          el.parentNode.removeChild(el);
        }
      }
    });
    Vue.prototype.$testAuth = function(auth) {
      // 获取权限列表
      let permissGroup = store.state.user.access;
      if (permissGroup.indexOf(auth) == -1) {
        return false
      } else {
        return true
      }
    }
  }
};

export default hasAuth;
