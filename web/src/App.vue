<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import Views from './views/Views'
import 'element-ui/lib/theme-chalk/index.css'

export default {
  components: {
    Views
  },
  mounted(){
    
  }

}
</script>


<style scoped>
</style>
