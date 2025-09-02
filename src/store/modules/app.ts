import { Module } from 'vuex';
import { AppSettings } from '@/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';

interface AppState {
  settings: AppSettings;
  loading: boolean;
  networkStatus: boolean;
  systemInfo: any;
}

const appModule: Module<AppState, any> = {
  namespaced: true,
  
  state: {
    settings: { ...DEFAULT_SETTINGS } as AppSettings,
    loading: false,
    networkStatus: true,
    systemInfo: {}
  },
  
  getters: {
    settings: (state) => state.settings,
    theme: (state) => state.settings.theme,
    language: (state) => state.settings.language,
    loading: (state) => state.loading,
    networkStatus: (state) => state.networkStatus,
    systemInfo: (state) => state.systemInfo,
    isDarkMode: (state) => {
      if (state.settings.theme === 'auto') {
        // 根据系统时间判断
        const hour = new Date().getHours();
        return hour < 6 || hour > 18;
      }
      return state.settings.theme === 'dark';
    }
  },
  
  mutations: {
    SET_SETTINGS(state, settings: Partial<AppSettings>) {
      state.settings = { ...state.settings, ...settings };
      // 持久化存储
      uni.setStorageSync(STORAGE_KEYS.SETTINGS, state.settings);
    },
    
    SET_THEME(state, theme: 'light' | 'dark' | 'auto') {
      state.settings.theme = theme;
      uni.setStorageSync(STORAGE_KEYS.SETTINGS, state.settings);
    },
    
    SET_LANGUAGE(state, language: 'zh-CN' | 'en-US') {
      state.settings.language = language;
      uni.setStorageSync(STORAGE_KEYS.SETTINGS, state.settings);
    },
    
    SET_LOADING(state, loading: boolean) {
      state.loading = loading;
    },
    
    SET_NETWORK_STATUS(state, status: boolean) {
      state.networkStatus = status;
    },
    
    SET_SYSTEM_INFO(state, systemInfo: any) {
      state.systemInfo = systemInfo;
    },
    
    INIT_APP_DATA(state) {
      // 从存储中恢复设置
      try {
        const settings = uni.getStorageSync(STORAGE_KEYS.SETTINGS);
        if (settings) {
          state.settings = { ...DEFAULT_SETTINGS, ...settings };
        }
      } catch (error) {
        console.error('初始化应用数据失败:', error);
        state.settings = { ...DEFAULT_SETTINGS } as AppSettings;
      }
    }
  },
  
  actions: {
    // 初始化应用
    async initApp({ commit, dispatch }) {
      try {
        // 初始化应用数据
        commit('INIT_APP_DATA');
        
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync();
        commit('SET_SYSTEM_INFO', systemInfo);
        
        // 监听网络状态
        uni.onNetworkStatusChange((res) => {
          commit('SET_NETWORK_STATUS', res.isConnected);
        });
        
        // 获取网络状态
        uni.getNetworkType({
          success: (res) => {
            commit('SET_NETWORK_STATUS', res.networkType !== 'none');
          }
        });
        
        return { success: true };
      } catch (error) {
        console.error('应用初始化失败:', error);
        return { success: false, error };
      }
    },
    
    // 更新设置
    updateSettings({ commit }, settings: Partial<AppSettings>) {
      commit('SET_SETTINGS', settings);
    },
    
    // 切换主题
    toggleTheme({ commit, state }) {
      const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(state.settings.theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      commit('SET_THEME', nextTheme);
    },
    
    // 设置主题
    setTheme({ commit }, theme: 'light' | 'dark' | 'auto') {
      commit('SET_THEME', theme);
    },
    
    // 设置语言
    setLanguage({ commit }, language: 'zh-CN' | 'en-US') {
      commit('SET_LANGUAGE', language);
    },
    
    // 显示加载
    showLoading({ commit }, title: string = '加载中...') {
      commit('SET_LOADING', true);
      uni.showLoading({ title, mask: true });
    },
    
    // 隐藏加载
    hideLoading({ commit }) {
      commit('SET_LOADING', false);
      uni.hideLoading();
    },
    
    // 显示提示
    showToast(_, { title, icon = 'none', duration = 2000 }: {
      title: string;
      icon?: 'success' | 'error' | 'loading' | 'none';
      duration?: number;
    }) {
      uni.showToast({
        title,
        icon,
        duration,
        mask: true
      });
    },
    
    // 显示模态框
    showModal(_, {
      title = '提示',
      content,
      showCancel = true,
      confirmText = '确定',
      cancelText = '取消'
    }: {
      title?: string;
      content: string;
      showCancel?: boolean;
      confirmText?: string;
      cancelText?: string;
    }): Promise<{ confirm: boolean; cancel: boolean }> {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          showCancel,
          confirmText,
          cancelText,
          success: (res) => {
            resolve({
              confirm: res.confirm,
              cancel: res.cancel
            });
          }
        });
      });
    },
    
    // 显示操作菜单
    showActionSheet(_, { itemList, itemColor = '#000000' }: {
      itemList: string[];
      itemColor?: string;
    }): Promise<{ tapIndex: number }> {
      return new Promise((resolve, reject) => {
        uni.showActionSheet({
          itemList,
          itemColor,
          success: (res) => {
            resolve({ tapIndex: res.tapIndex });
          },
          fail: reject
        });
      });
    },
    
    // 重置设置
    resetSettings({ commit }) {
      commit('SET_SETTINGS', { ...DEFAULT_SETTINGS });
    }
  }
};

export default appModule;