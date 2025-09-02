import { Module } from 'vuex';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { userApi } from '@/api';

interface UserState {
  userInfo: User | null;
  token: string;
  isLoggedIn: boolean;
}

const userModule: Module<UserState, any> = {
  namespaced: true,
  
  state: {
    userInfo: null,
    token: '',
    isLoggedIn: false
  },
  
  getters: {
    userInfo: (state) => state.userInfo,
    token: (state) => state.token,
    isLoggedIn: (state) => state.isLoggedIn,
    userId: (state) => state.userInfo?.id || '',
    username: (state) => state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },
  
  mutations: {
    SET_TOKEN(state, token: string) {
      state.token = token;
      state.isLoggedIn = !!token;
      // 持久化存储
      if (token) {
        uni.setStorageSync(STORAGE_KEYS.TOKEN, token);
      } else {
        uni.removeStorageSync(STORAGE_KEYS.TOKEN);
      }
    },
    
    SET_USER_INFO(state, userInfo: User | null) {
      state.userInfo = userInfo;
      // 持久化存储
      if (userInfo) {
        uni.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
      } else {
        uni.removeStorageSync(STORAGE_KEYS.USER_INFO);
      }
    },
    
    CLEAR_USER_DATA(state) {
      state.userInfo = null;
      state.token = '';
      state.isLoggedIn = false;
      // 清除存储
      uni.removeStorageSync(STORAGE_KEYS.TOKEN);
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO);
    },
    
    INIT_USER_DATA(state) {
      // 从存储中恢复用户数据
      try {
        const token = uni.getStorageSync(STORAGE_KEYS.TOKEN);
        const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
        
        if (token) {
          state.token = token;
          state.isLoggedIn = true;
        }
        
        if (userInfo) {
          state.userInfo = userInfo;
        }
      } catch (error) {
        console.error('初始化用户数据失败:', error);
      }
    }
  },
  
  actions: {
    // 登录
    async login({ commit }, loginData: { username: string; password: string }) {
      try {
        const response = await userApi.login(loginData) as any;
        const { token, userInfo } = response.data || {};
        
        commit('SET_TOKEN', token);
        commit('SET_USER_INFO', userInfo);
        
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // 注册
    async register({ commit }, registerData: { username: string; password: string; email?: string }) {
      try {
        const response = await userApi.register(registerData) as any;
        const { token, userInfo } = response.data || {};
        
        commit('SET_TOKEN', token);
        commit('SET_USER_INFO', userInfo);
        
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // 获取用户信息
    async getUserInfo({ commit, state }) {
      if (!state.token) {
        return { success: false, error: '未登录' };
      }
      
      try {
        const userInfo = await userApi.getProfile();
        commit('SET_USER_INFO', userInfo);
        return { success: true, data: userInfo };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // 更新用户信息
    async updateUserInfo({ commit }, userData: Partial<User>) {
      try {
        const userInfo = await userApi.updateProfile(userData);
        commit('SET_USER_INFO', userInfo);
        return { success: true, data: userInfo };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // 登出
    logout({ commit }) {
      commit('CLEAR_USER_DATA');
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/login'
      });
    },
    
    // 初始化用户数据
    initUserData({ commit }) {
      commit('INIT_USER_DATA');
    },
    
    // 检查登录状态
    checkLoginStatus({ state, dispatch }) {
      if (state.token && !state.userInfo) {
        // 有token但没有用户信息，尝试获取用户信息
        dispatch('getUserInfo');
      }
    }
  }
};

export default userModule;