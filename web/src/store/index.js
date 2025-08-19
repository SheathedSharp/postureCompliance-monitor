import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token")
  },
  getters: {

  },
  mutations: {
    setToken(state, payload){
      state.token = payload.token
      localStorage.setItem("token", payload.token)
    },
    removeToken(state, payload){
      state.token = null
      localStorage.removeItem("token")
    }
  },
  actions: {
  },
  modules: {
  }
})
