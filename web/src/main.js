import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "@/assets/reset.css"
import { valid } from "./utils/auth.js"
import { Message, Loading } from 'element-ui';
import { Notification } from 'element-ui';
import * as axios from "axios"
Vue.prototype.$axios = axios
Vue.prototype.$validate = (form, requires, type)=>{
    // requires: [
    //   {property: "", require: true, rule: ()=>{}, msg: "", name: ""}
    // ]
    var msgs = []
    requires.forEach((e)=>{
        if(e.require && (form.hasOwnProperty(e.property) == false || form[e.property].length == 0)){
            msgs.push(`${e.name || e.property}不能为空`)
        }
        else if(e.require && form.hasOwnProperty(e.property)){
            if(!e.rule || e.rule(form[e.property])) return
            else{
                msgs.push(e.msg)
            }
        }
    })
    msgs.forEach((e)=>{
        Notification({
          type,
          title: '提示',
          message: e
        })
    })
    return msgs
}
Vue.config.productionTip = false
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1, //month  
        "d+": this.getDate(), //day  
        "h+": this.getHours(), //hour  
        "m+": this.getMinutes(), //minute  
        "s+": this.getSeconds(), //second  
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter  
        "S": this.getMilliseconds() //millisecond  
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
router.beforeEach((to, from, next)=>{
    // if(to.meta.requiresAuth)
    let loading
    new Promise((resolve, reject)=>{
        loading = Loading.service({fullscreen: true, background: "rgba(0,0,0,0.2)"})
        if(store.state.token){
            valid(store.state.token)
            .then((e)=>{
                if(e.data.code == 1) resolve(e.data)
                else reject(e.data)
            }, (e)=>{
                reject("请求失败", e)
            })
            .finally(e=>{
                loading.close()
            })
        }
        else{
            loading.close()
            reject("没有登录凭证")
        }
    })
    .then((e)=>{
        console.log("已登录")
        // 处理已登录情况的路由跳转
        if(to.meta.rejectAuth) next({name: "home"})
        else next()
    }, (e)=>{
        console.log(e)
        // 处理未登录情况的路由跳转
        if(to.meta.requiresAuth) next({name: "sign"})
        else next()
    })
})
Vue.prototype.$message = Message
Vue.prototype.$loading = Loading
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
