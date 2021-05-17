<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
      <span slot="prepend">
        <Icon :size="16" type="ios-person"></Icon>
      </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
      <span slot="prepend">
        <Icon :size="14" type="md-lock"></Icon>
      </span>
      </Input>
    </FormItem>
    <FormItem prop="identifyText">
      <i-input placeholder="请输入验证码" v-model="form.identifyText" style="width:150px;" :maxlength="4">
        <span slot="prepend">
          <Icon :size="14" type="md-key"></Icon>
        </span>
      </i-input>
      <div class="code" @click="refreshCode">
        <Sidentify :identifyCode="form.identifyCode"></Sidentify>
      </div>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
  import Sidentify from '_c/identify';
  export default {
    components: {
      Sidentify
    },
    name: 'LoginForm',

    data() {
      const identifyRules = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('验证码不能为空'))
        } else if (value.toUpperCase() != this.form.identifyCode.toUpperCase()) {
          this.refreshCode()
          return callback(new Error('验证码输入错误,请重新输入'))
        } else {
          callback()
        }
      }
      return {
        form: {
          userName: '',
          password: '',
          identifyText: '',
          identifyCode: '',
        },
        //identifyCodes: '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        identifyCodes:'1',
        rules: {
          userName: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
          password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
          identifyText: [{validator: identifyRules, trigger: 'blur'}]
        }
      }
    },
    created () {
      this.refreshCode()
    },
    computed: {
      },
    methods: {
      handleSubmit() {
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            this.$emit('on-success-valid', {
              userName: this.form.userName,
              password: this.form.password,
              imageCode: this.form.identifyText,
            })
          }
        })
      },
      refreshCode () {
         this.form.identifyCode = ''
         this.makeCode(this.identifyCodes, 4)
      },
      makeCode (o, l) {
        for (let i = 0; i < l; i++) {
          this.form.identifyCode += this.identifyCodes[
            this.randomNum(0, this.identifyCodes.length)
          ]
        }
      },
      randomNum (min, max) {
        return Math.floor(Math.random() * (max - min) + min)
      },
    }
  }
</script>
<style>
.code {
  position: absolute;
  left: 171px;
  top: 1px;
}
</style>
