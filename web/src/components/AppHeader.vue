<template>
    <div class="header">
        <div class="logo" @click="$router.push({name: 'home'})"></div>
        <div class="space"></div>
        <div class="notice"></div>
        <div class="avatar" :style="{background: `url(${info ? info.avatar : 'https://img2.baidu.com/it/u=361604991,2000575362&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500'}) center/100%`}">
            <div class="list">
                <div class="exit" @click="signout">退出登录</div>
            </div>
        </div>
    </div>
</template>

<script>
import * as http from "../utils/http"
export default {
    data(){
        return {
            info: null
        }
    },
    created(){
        http.post("/doctor/user/info", {
            token: this.$store.state.token
        })
        .then((e)=>{
            console.log(e.data.data)
            this.info = e.data.data
        })

    },
    methods: {
        signout(){
            this.$store.commit("removeToken")
            this.$router.push({name: "sign"})
        }
    }
}
</script>

<style scoped>
    .header{
        height: 64px;
        display: flex;
        padding-left: 39px;
        padding-right: 23px;
        align-items: center;
        box-shadow: 0px 3px 6px 1px rgba(0,0,0,0.1600);
    }
    .space{
        flex-grow: 1;
    }
    .logo{
        width: 122px;
        height: 100%;
        background:  center/120% url('@/assets/headerlogo.png');
        cursor: pointer;
    }
    .notice{
        width: 31px;
        height: 23px;
        background: lightcoral;
        background:  center/100% url('@/assets/message.png');
        cursor: pointer;
    }
    .avatar{
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid #13EAF2;
        margin-left: 23px;
        cursor: pointer;
        position: relative;
    }
    .avatar .list{
        display: none;
        padding-top: 10px;
        position: absolute;
        z-index: 10;
        width: 120px;
        top: 44px;
        right: -15px;
        background: rgba(0,0,0,0);
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
        overflow: hidden;
    }
    .avatar:hover .list{
        display: block;
    }
    .avatar .list .exit{
        height: 30px;
        color: white;
        line-height: 30px;
        font-size: 18px;
        text-align: center;
        cursor: pointer;
        background: lightblue;
        padding: 10px 0;
    }
    .avatar .list .exit:hover{
        background: rgb(31, 151, 191);
    }
</style>