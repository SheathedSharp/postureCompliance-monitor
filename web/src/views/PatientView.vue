<template>
  <div class="patient">
    <div class="patient-content">
      <div class="documents">
        <div class="documents-name">患者档案</div>
        <div class="documents-content">
          <div class="user-card" v-for="item in normalPatient" :key="item.id" @click="openPatientDetail(item.id)">
            <div class="user-id">
              编号：#{{item.id}}
            </div>
            <div class="user-avatar" :style="{background: `url(${item.avatar}) center/100%`}">
              
            </div>
            <div class="user-name">
              用户：{{item.realname}}
            </div>
          </div>
        </div>
      </div>
      <div class="alarms">
        <div class="alarms-header">
          <div class="alarms-title">用户警报数</div>
          <div class="alarms-number">11</div>
          <div class="alarms-icon"></div>
        </div>
        <div class="alarms-content">
          <div class="alarms-user-card" v-for="item in normalPatient" :key="item.id" @click="openPatientDetail(item.id)">
            <div class="alarms-user-tip">查看详情 ></div>
            <div class="alarms-user-avatar" :style="{background: `url(${item.avatar}) center/100%`}"></div>
            <div class="alarms-user-name">{{item.realname}}</div>
            <div class="alarms-user-status">状态：警戒</div>
            <div class="alarms-user-id">编号：#{{item.id}}</div>
          </div>
        </div>
      </div>
      <div class="patientinfo" v-if="existPatientInfo">
        <PatientInfo :patientIndex="patientIndex" :closePatientDetail="closePatientDetail" />
      </div>
    </div>
    
  </div>
</template>

<script>
import * as http from "../utils/http"
import PatientInfo from "../components/PatientInfo.vue"
export default {
  components: {
    PatientInfo
  },
  data(){
    return{
      normalPatient: [],
      existPatientInfo: false,
      patientIndex: undefined
    }
  },
  mounted(){
    http.post("/doctor/patient/patientlist")
    .then((e)=>{
      console.log(e.data.data)
      this.normalPatient = e.data.data
    })
  },
  methods:{
    openPatientDetail(id){
      this.existPatientInfo = true
      this.patientIndex = id
    },
    closePatientDetail(){
      this.existPatientInfo = false
    }
  }
}
</script>

<style scoped>
  .patient{
    height: 100%;
    padding: 27px 50px 16px 33px;
    box-sizing: border-box;
    color: white;
  }
  .patient-content{
    height: 100%;
    display: flex;
    position: relative;
  }
  .documents{
    flex-grow: 1;
    border-radius: 10px;
    background: rgba(80, 146, 241);
    overflow: hidden;
  }
  .documents-name{
    height: 37px;
    line-height: 37px;
    font-size: 15px;
    color: white;
    text-indent: 1em;
    background: rgba(112, 180, 249);
  }
  .alarms{
    width: 256px;
    flex-shrink: 0;
    background: rgba(69, 133, 229);
    border-radius: 10px;
    margin-left: 33px;
    padding: 15px;
    overflow: hidden;
  }
  .documents-content{
    margin: 18px;
    max-height: calc(100% - 37px - 36px);
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
  }
  .user-card{
    width: 139px;
    height: 139px;
    border-radius: 10px;
    margin-bottom: 10px;
    margin-right: 10px;
    background: rgba(119, 186, 249);
    color: white;
    padding: 6px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .user-card:hover{
    background: rgb(70, 144, 213);
  }
  .user-id{
    font-size: 8px;
    font-weight: 300;
  }
  .user-avatar{
    width: 73px;
    height: 73px;
    margin: 13px auto 8px auto;
    border-radius: 50%;
  }
  .user-name{
    font-size: 12px;
    text-align: center;
    font-weight: 500;
  }
  .alarms-header{
    display: flex;
    align-items: baseline;
    margin-bottom: 9px;
  }
  .alarms-title{
    font-size: 15px;
    margin-right: 1em;
  }
  .alarms-number{
    font-size: 30px;
  }
  .alarms-content{
    max-height: calc(100% - 51px);
    overflow: scroll;
  }
  .alarms-user-card{
    height: 71px;
    background: rgb(106, 173, 249);
    border-radius: 10px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 11px;
    font-size: 12px;
    margin-bottom: 14px;
    cursor: pointer;
  }
  .alarms-user-card:hover{
    background: rgb(70, 144, 213);
  }
  .alarms-user-tip{
    position: absolute;
    right: 10px;
    top: 5px;
    font-size: 8px;
  }
  .alarms-user-avatar{
    width: 50px;
    height: 50px;
    background: lightblue;
    margin-right: 13px;
    border-radius: 50%;
  }
  .alarms-user-name{
    width: 50px;
    font-weight: 300;
    overflow: hidden;
    margin-right: 1em;
  }
  .alarms-user-id{
    position: absolute;
    right: 12px;
    bottom: 5px;
    font-size: 8px;
    color: rgba(255,255,255,0.5900);
  }
  .patientinfo{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }
</style>