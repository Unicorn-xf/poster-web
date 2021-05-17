<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form ref="LoginForm" @on-success-valid="handleSubmit"></login-form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
  import LoginForm from '_c/login-form'
  import {
    login
  } from "@/api/user";
  import md5 from 'js-md5';
  import {
    mapActions
  } from 'vuex'
  import {setCookiesValue} from '@/libs/util'
  export default {
    components: {
      LoginForm
    },
    mounted() {
      setCookiesValue("isLoginPage","true")
    },
    methods: {
      ...mapActions([
        'handleLogin',
        'getUserInfo'
      ]),
      handleSubmit({
        userName,
        password
      }) {
        userName = userName.trim()
        password = md5(password);
        login({
          userName,
          password
        }).then(res => {
          // console.log("res: " + JSON.stringify(res));
          if (res.data.code == 2003) {
            this.handleLogin({
              res
            }).then(res => {
              this.getUserInfo().then(res => {
                // console.log("res1: " + JSON.stringify(res));
                if (res.code == 1000) {
                  setCookiesValue("isLoginPage","false")
                  this.$router.push({
                    name: this.$config.homeName
                  })
                } else {
                  this.$Message.error(res.message);
                  this.$refs.LoginForm.refreshCode();
                }
              })
            })
          } else {
            this.$Message.error(res.data.message);
            this.$refs.LoginForm.refreshCode();
          }
        })
      }
    }
  }
</script>

<style>

</style>
