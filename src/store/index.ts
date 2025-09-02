import Vue from 'vue'
import Vuex from 'vuex'
import Photo from './modules/photo'
import user from './modules/user'
import app from './modules/app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    Photo,
    user,
    app
  },
  
  // 全局状态
  state: {
    version: '1.0.0'
  },
  
  // 全局getters
  getters: {
    version: state => state.version
  },
  
  // 全局mutations
  mutations: {
    // 可以在这里添加全局的mutations
  },
  
  // 全局actions
  actions: {
    // 应用初始化
    async initApp({ dispatch }) {
      try {
        // 初始化应用模块
        await dispatch('app/initApp');
        
        // 初始化用户数据
        dispatch('user/initUserData');
        
        // 检查登录状态
        dispatch('user/checkLoginStatus');
        
        return { success: true };
      } catch (error) {
        console.error('应用初始化失败:', error);
        return { success: false, error };
      }
    }
  }
})

export default store