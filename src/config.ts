interface EnvironmentConfig {
  host: string;
  timeout: number;
  enableLog: boolean;
}

const baseApi: { [key: string]: EnvironmentConfig } = {
  // 开发版
  development: {
    host: "http://0.0.0.0:8080",
    timeout: 30000,
    enableLog: true,
  },
  // 体验版
  trial: {
    host: "https://api-test.yourdomian.com",
    timeout: 15000,
    enableLog: true,
  },
  // 正式版
  release: {
    host: "https://api.yourdomian.com",
    timeout: 15000,
    enableLog: false,
  },
  // uniapp 正式环境
  production: {
    host: "https://api.yourdomian.com",
    timeout: 15000,
    enableLog: false,
  },
};

// 环境
export const env = process.env.NODE_ENV || 'development';

// 当前环境配置
export const config = baseApi[env];

// API 基础地址
export const baseUrl = config.host;

// 请求超时时间
export const timeout = config.timeout;

// 是否启用日志
export const enableLog = config.enableLog;

// API 端点配置
export const API_ENDPOINTS = {
  // 用户相关
  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
  },
  // 证件照相关
  PHOTO: {
    UPLOAD: '/api/photo/upload',
    PROCESS: '/api/photo/process',
    DOWNLOAD: '/api/photo/download',
    HISTORY: '/api/photo/history',
  },
  // 模板相关
  TEMPLATE: {
    LIST: '/api/template/list',
    DETAIL: '/api/template/detail',
  },
};

// 常用尺寸配置
export const PHOTO_SIZES = {
  '1寸': { width: 295, height: 413, name: '1寸证件照' },
  '2寸': { width: 413, height: 579, name: '2寸证件照' },
  '小1寸': { width: 260, height: 378, name: '小1寸证件照' },
  '小2寸': { width: 378, height: 520, name: '小2寸证件照' },
  '护照': { width: 390, height: 567, name: '护照证件照' },
  '签证': { width: 390, height: 567, name: '签证证件照' },
  '驾驶证': { width: 260, height: 378, name: '驾驶证证件照' },
};

// 背景颜色配置
export const BACKGROUND_COLORS = {
  WHITE: { color: '#FFFFFF', name: '白色' },
  RED: { color: '#FF0000', name: '红色' },
  BLUE: { color: '#0000FF', name: '蓝色' },
  GRAY: { color: '#C0C0C0', name: '灰色' },
};
