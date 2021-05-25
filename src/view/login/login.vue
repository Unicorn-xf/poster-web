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
        phoneNum,
        passwd
      }) {
        phoneNum = phoneNum.trim()
        //password = md5(password);
        login({
          phoneNum,
          passwd
        }).then(res => {
          if (res.data.retcode == '0000') {
            this.handleLogin({
              res
            }).then(res => {
              this.getUserInfo().then(res => {
                //console.log("res1: " + JSON.stringify(res));
                if (res.retcode == '0000') {
                  setCookiesValue("isLoginPage","false")
                  this.$router.push({
                    name: this.$config.homeName
                  })
                } else {
                  this.$refs.LoginForm.refreshCode();
                }
              })
            })
          } else {
            this.$refs.LoginForm.refreshCode();
          }
        })
      }
    }
  }
</script>

<style>

</style>
