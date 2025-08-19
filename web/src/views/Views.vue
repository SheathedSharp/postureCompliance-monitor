<template>
  <div id="View">
    <AppHeader />
    <div class="content">
      <div class="nav">
        <Nav :list="list" :index="index" :navItemClick="navItemClick" />
      </div>
      <div class="view">
        <router-view/>
      </div>
    </div>
  </div>
</template>
<script>
import AppHeader from '@/components/AppHeader.vue'
import Nav from '@/components/Nav.vue'
export default {
  name: "views",
  components: {
    AppHeader,
    Nav
  },
  data(){
    return {
      list: [
          {name: "首页", icon: "", path: "/", routename: "home"},
          {name: "患者管理", icon: "", path: "/patient", routename: "patient"},
          {name: "文章推送", icon: "", path: "/article", routename: "article"},
          {name: "系统设置", icon: "", path: "/settings", routename: "settings"}
      ],
      index: 0
    }
  },
  methods: {
    navItemClick(item, i){
      if(this.index != i) {
        this.index = i;
        this.$router.push(item.path)
      }
    },
  },
  watch:{
    $route: {
      immediate: true,
      handler: function(o, n){
        this.list.some((item, index)=>{
          if(item.routename == this.$route.name){
            this.index = index
            return true
          }
        })
      }
    }
  }


}
</script>


<style scoped>
  #View{
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: hidden;
    
  }
  .content{
    /* flex-grow: 1; */
    display: flex;
    height: calc(100vh - 64px);
  }
  .nav{
    height: 100%;
    width: 199px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #2081FF 0%, #7ACDFF 100%);
  }
  .view{
    height: 100%;
    min-width: 795px;
    flex-grow: 1;
    background: linear-gradient(180deg, #0068CF 0%, #4E88DE 100%);
  }
</style>
