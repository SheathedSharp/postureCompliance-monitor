<template>
  <div class="patientinfo-content">
    <div class="header-bar">
        <div class="close-btn" @click="closePatientDetail">X</div>
    </div>
    <div class="patientinfo-container">
        <div class="patientdetail">
            <div class="edit" @click="editmode=!editmode">编辑</div>
            <div class="id">编号：#{{info ? info.id : ''}}</div>
            <div class="avatar" :style="{background: `url(${info ? info.avatar : 'https://img2.baidu.com/it/u=361604991,2000575362&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500'}) center/100%`}"></div>
            <div class="realname">名字：{{info ? info.realname : ''}}</div>
            <div class="gender detailformat">
                <div class="key">性别：</div>
                <input type="text" :class="{'input-editmode': editmode}" :disabled="!editmode" :value="info ? info.gender : ''">
            </div>
            <div class="age detailformat">
                <div class="key">年龄：</div>
                <input type="text" :class="{'input-editmode': editmode}" :disabled="!editmode" :value="info ? info.age : ''">
            </div>
            <div class="hospital detailformat">
                <div class="key">医院：</div>
                <input type="text" :class="{'input-editmode': editmode}" :disabled="!editmode" :value="info ? info.hospital : ''">
            </div>
            <div class="disease detailformat">
                <div class="key">病症：</div>
                <input type="text" :class="{'input-editmode': editmode}" :disabled="!editmode" value="视网膜脱落">
            </div>
            <div class="stage detailformat">
                <div class="key">恢复阶段：</div>
                <input type="text" :class="{'input-editmode': editmode}" :disabled="!editmode" value="第六期">
            </div>
        </div>
        <div class="function">
            <div class="function-title">{{content_idx == 0 ? "实时数据分析" : "眼球模拟"}}</div>
            <div class="function-menu">
                <div class="function-menu-item" @click="content_idx=0">
                    角度监测
                </div>
                <div class="function-menu-item" @click="content_idx=1">
                    眼球模拟
                </div>
            </div>
            <div class="function-content">
                <DegreeRecord :patientid="patientIndex" v-if="content_idx == 0" />
                <EyeballSimulation v-else-if="content_idx == 1" />
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import * as http from "../utils/http"
import DegreeRecord from "./DegreeRecord.vue"
import Chat from "./Chat.vue"
import EyeballSimulation from "./EyeballSimulation.vue"

export default {
    components: {
        DegreeRecord,
        Chat,
        EyeballSimulation
    },
    data(){
        return {
            info: null,
            editmode: false,
            content_idx: 0
        }
    },
    created(){
        let loading = this.$loading.service({fullscreen: true, background: "rgba(0,0,0,0.2)"})
        http.post("/doctor/patient/patientdetail", {patientid: this.patientIndex})
        .then((e)=>{
            console.log(e.data)
            this.info = e.data.data
            loading.close()
        })
    },
    props:{
        patientIndex: {
            require: true
        },
        closePatientDetail: {
            require: true,
            type: Function
        }
    }
}
</script>

<style scoped>
    .patientinfo-content{
        background: rgba(80, 146, 241);
        width: 100%;
        height: 100%;
    }
    .header-bar{
        height: 37px;
        background: rgb(113, 182, 249);
        overflow: hidden;
    }
    .close-btn{
        width: 20px;
        height: 20px;
        cursor: pointer;
        margin: 12px;
        font-family: monospace;
    }
    .patientinfo-container{
        margin: 21px 15px 17px 15px;
        height: calc(100% - 37px - 21px - 17px);

        display: flex;
    }
    .patientdetail{
        width: 290px;
        height: 100%;
        background: rgb(138, 182, 246);
        border-radius: 10px;
        position: relative;
        color: white;
        overflow: scroll;
        padding-bottom: 50px;
        box-sizing: border-box;
    }
    .edit{
        position: absolute;
        top: 16px;
        right: 11px;
        width: 62px;
        height: 31px;
        line-height: 31px;
        font-size: 15px;
        border-radius: 10px;
        background: rgb(164, 200, 248);
        cursor: pointer;
        text-align: center;
    }
    .edit:hover{
        background: rgb(118, 164, 224);
    }
    .id{
        font-size: 15px;
        margin-top: 8px;
        margin-left: 11px;
        font-weight: 300;
    }
    .avatar{
        margin: 31px auto 18px auto;
        width: 175px;
        height: 175px;
        border-radius: 50%;
        background: lightblue;
    }
    .realname{
        font-size: 20px;
        text-align: center;
    }
    .detailformat{
        height: 45px;
        line-height: 45px;
        margin: 0 16px;
        border-bottom: 1px white solid;
        display: flex;
        font-size: 15px;
    }
    .detailformat .key{
        font-weight: 300;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    .detailformat input{
        flex-grow: 1;
        height: 30px;
        margin: auto 0;
        text-align: center;
        font-weight: 500;
        background: none;
        color: inherit;
        margin-right: 30px;
    }
    .detailformat .input-editmode{
        background: white;
        color: black;
        border: 1px solid lightblue;
    }
    .function{
        background: rgb(98, 163, 248);
        height: 100%;
        flex-grow: 1;
        margin-left: 25px;
        border-radius: 10px;
        padding: 47px 12px 12px 12px;
        box-sizing: border-box;
        position: relative;
        /* overflow: hidden; */
    }
    .function-title{
        height: 30px;
        width: 100%;
        background: rgb(60, 121, 215);
        position: absolute;
        top: 0;
        left: 0;
        color: white;
        text-indent: 1em;
        line-height: 30px;
        font-size: 14px;
    }
    .function-menu{
        width: 86px;
        float: right;
        margin-left: 10px;
    }
    .function-menu-item{
        height: 31px;
        width: 100%;
        background: rgb(151, 191, 241);
        border-radius: 10px;
        text-align: center;
        line-height: 31px;
        margin-bottom: 16px;
        font-size: 15px;
        cursor: pointer;
        box-shadow: 0px 3px 6px 1px rgba(0,0,0,0.1600);
    }
    .function-menu-item:hover{
        background: rgb(121, 169, 229);
    }
    .function-content{
        height: 100%;
        background: rgb(164, 202, 250);
        overflow: scroll;
        border-radius: 10px;
        padding: 10px;
        box-sizing: border-box;
    }
</style>