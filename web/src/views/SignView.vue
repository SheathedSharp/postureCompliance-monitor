<template>
  <div class="sign">
    <div class="sign-box">
      <div class="title">
        <span :class="{'title-check': mode}" @click="mode=true">密码登录</span>
        <span class="tab-line"></span>
        <span :class="{'title-check': !mode}" @click="mode=false">账号注册</span>
      </div>
      <div class="form">
        <div class="form-wrapper" key="signin" v-if="mode==true">
          <div class="account input-box">
            <span class="text" >账号</span>
            <input type="text" placeholder="请输入账号" v-model="signin.phone" />
          </div>
          <div class="password input-box">
            <span class="text">密码</span>
            <input type="password" placeholder="请输入密码" v-model="signin.password" @keypress="enterSignIn" />
          </div>
        </div>
        <div class="form-wrapper" key="signup" v-else>
          <div class="account input-box">
            <span class="text">+86</span>
            <input type="text" placeholder="请输入手机号" v-model="signup.phone" />
          </div>
          <div class="password input-box">
            <span class="text">密码</span>
            <input type="password" placeholder="请输入密码" v-model="signup.password" />
          </div>
          <div class="password input-box">
            <span class="text">密码</span>
            <input type="password" placeholder="请再次输入密码" v-model="signup.password_a" @keypress="enterSignUp" />
          </div>
        </div>
        <div class="login-register-wrapper" v-if="mode">
          <div class="register-btn" @click="mode=false">注册</div>
          <div class="login-btn" @click="doSignIn">登录</div>
        </div>
        <div class="login-register-wrapper" v-else>
          <div class="register-btn" @click="doSignUp">注册</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as auth from "../utils/auth.js"
import {isMobile} from "../utils/util.js"

export default {
    mounted(){
      
    },
    data(){
      return {
        mode: true,
        signin: {
          phone: "",
          password: ""
        },
        signup: {
          phone: "",
          password: "",
          password_a: ""
        }
      }
    },
    methods: {
      doSignIn(){
        let loading
        var msgs = this.$validate(this.signin, [
          {property: "phone", name: "账号/手机号", require: true, rule: isMobile, msg: "账号/手机号格式错误！"},
          {property: "password", name: "密码", require: true, rule: null, msg: "密码格式错误！"}
        ], "error")
        if(msgs.length>0) {
          console.log(msgs)
          return
        }
        new Promise((resolve, reject)=>{
          loading = this.$loading.service({fullscreen: true})
          resolve(auth.signin(this.signin))
        })
        .then((e)=>{
          console.log(e)
          console.log(e.data)
          if(e.data.code){
            console.log("e.data.data.token is",e.data.data.token)
            this.$store.commit("setToken", {token: e.data.data.token})
            return this.$router.push({name: "home"})
          }
          else{
            return Promise.reject(e)
          }
        })
        .then((e)=>{
          loading.close()
          this.$message({
            showClose: true,
            message: '登录成功',
            type: 'success'
          })
        }, (e)=>{
          loading.close()
          this.$message({
            showClose: true,
            message: '登录失败, 账号或密码错误',
            type: 'error'
          })
        })
        
        
      },
      doSignUp(){
        let loading
        var msgs = this.$validate(this.signin, [
          {property: "phone", require: true, name: "账号/手机号", rule: isMobile, msg: "账号/手机号格式错误！"},
          {property: "password", require: true,  name: "密码", rule: null, msg: "密码不能为空"},
          {property: "password_a", require: true,  name: "重新输入密码",rule: (e)=>e==this.signup.password, msg: "密码输入不一致"},
        ], "error")
        if(msgs.length>0) {
          console.log(msgs)
          return
        }
        new Promise((resolve, reject)=>{
          loading = this.$loading.service({fullscreen: true})
          resolve(auth.signup(this.signup))
        })
        .then((e)=>{
          console.log(e.data)
          loading.close()
        })
      },
      printdata(){
        console.log(this.signin, this.signup)
      },
      enterSignIn(e){
        if(e.keyCode == 13) this.doSignIn()
      },
      enterSignUp(e){
        if(e.keyCode == 13) this.doSignUp()
      }
    },
    watch:{
      mode(){
        if(this.mode) this.signup = {}
        else this.signin = {}
      }
    }
}
</script>

<style scoped>
  .sign{
    height: 100vh;
    width: 100vw;
    display: flex;
    background: lightblue;
    align-items: center;
    justify-content: center;
  }
  .sign-box{
    width: 700px;
    height: 400px;
    border-radius: 10px;
    background: white;
    padding: 50px 70px;
    box-sizing: border-box;
  }
  .title{
    text-align: center;
    font-size: 18px;
  }
  .title span{
    cursor: pointer;
  }
  .form-wrapper{
    border: 1px #ccc solid;
    border-radius: 8px;
    margin: 30px auto;
    width: 75%;

  }
  .form-wrapper .input-box{
    height: 50px;
    line-height: 50px;
    border-bottom: 1px #ccc solid;
    padding: 0 20px;
    font-size: 18px;
  }
  .form-wrapper .input-box input{
    width: 75%;
    font-size: 16px;
  }
  .form-wrapper .input-box:last-child{
    border-bottom: none;
  }
  .form-wrapper .text{
    margin-right: 20px;
  }
  .login-register-wrapper{
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    width: 80%;
  }
  .register-btn, .login-btn{
    height: 40px;
    line-height: 40px;
    width: 192px;
    border: 1px #ccc solid;
    box-sizing: border-box;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
  }
  .register-btn:hover{
    color: #00a1d6;
    border-color: #00a1d6;
  }
  .login-btn{
    background: #00a1d6;
    color: white;
  }
  .login-btn:hover{
    background: #33b4de;
  }
  .title-check{
    color: #4fa5d9;
  }
  .tab-line{
    border: 0.5px solid #ccc;
    margin: 0 30px;
  }
</style>