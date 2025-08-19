<template>
  <div class="home">
    <div class="realtimeData">
      <div class="card" v-for="item in realtimeData" :key="item.name">
        <div class="left">
          <div class="name">{{item.name}}</div>
          <div class="data">{{item.data}}</div>
          <div class="time">{{item.time}}</div>
        </div>
        <div class="left">
          <div class="icon">{{item.icon}}</div>
        </div>
      </div>
    </div>
    <div class="others">
      <div class="settings card" @click="$router.push({name: 'settings'})">
        <div class="icon"></div>
        <div class="name">系统设置</div>
      </div>
      <div class="news card">
        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      realtimeData: [
        {name: "日新增用户数", data: "22", time: new Date().format("yyyy年MM月dd日"), icon: ""},
        {name: "实时监控数", data: "550", time: new Date().format("yyyy年MM月dd日"), icon: ""},
        {name: "康复满意度", data: "99%", time: new Date().format("yyyy年MM月dd日"), icon: ""},
        {name: "用户警报数", data: "11", time: new Date().format("yyyy年MM月dd日"), icon: ""}
      ]
    }
  }
}
</script>

<style scoped>
  .left{
    float: left;
  }
  .home{
    color: white;
    padding: 27px 61px 0 66px;
  }
  .realtimeData{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .card{
    border-radius: 10px;
  }
  .realtimeData .card{
    width: 245px;
    height: 152px;
    margin-bottom: 30px;
    background-color: rgba(255, 255, 255, 0.15);
    box-sizing: border-box;
    padding-left: 23px;
    padding-top: 26px;
  }
  .realtimeData .card .name{
    font-size: 20px;
    font-weight: 300;
  }
  .realtimeData .card .data{
    font-size: 40px;
    font-weight: 400;
  }
  .realtimeData .card .time{
    font-size: 15px;
    font-weight: 300;
  }
  .others{
    display: flex;
  }
  .others .settings{
    width: 233px;
    height: 196px;
    background-color: white;
    text-align: center;
    padding-top: 44px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .others .settings:hover{
    background: rgb(255, 255, 255, 0.7);
  }
  .others .settings .icon{
    width: 87px;
    height: 87px;
    margin: 0 auto;
    background:  center/120% url('@/assets/settings.png');
  }
  .others .settings .name{
    color: black;
    font-size: 20px;
    font-weight: 300;
    font-family: PingFang SC-Light, PingFang SC;
    margin-top: 18px;
  }
</style>