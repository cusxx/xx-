import { PhotoSize, BackgroundColor } from '@/types';

// 应用常量
export const APP_CONFIG = {
  NAME: '松鼠证件照',
  VERSION: '1.0.0',
  AUTHOR: 'soulerror',
  DESCRIPTION: '基于AI算法的智能证件照制作工具',
  HOMEPAGE: 'https://github.com/soulerror/HivisionIDPhotos-Uniapp'
};

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SETTINGS: 'appSettings',
  PHOTO_HISTORY: 'photoHistory',
  RECENT_TEMPLATES: 'recentTemplates',
  UPLOAD_CACHE: 'uploadCache'
};

// 常用证件照尺寸（像素）
export const PHOTO_SIZES: Record<string, PhotoSize> = {
  '1寸': {
    width: 295,
    height: 413,
    name: '1寸证件照',
    dpi: 300
  },
  '2寸': {
    width: 413,
    height: 579,
    name: '2寸证件照',
    dpi: 300
  },
  '小1寸': {
    width: 260,
    height: 378,
    name: '小1寸证件照',
    dpi: 300
  },
  '小2寸': {
    width: 378,
    height: 520,
    name: '小2寸证件照',
    dpi: 300
  },
  '护照': {
    width: 390,
    height: 567,
    name: '护照证件照',
    dpi: 300
  },
  '签证': {
    width: 390,
    height: 567,
    name: '签证证件照',
    dpi: 300
  },
  '驾驶证': {
    width: 260,
    height: 378,
    name: '驾驶证证件照',
    dpi: 300
  },
  '身份证': {
    width: 358,
    height: 441,
    name: '身份证证件照',
    dpi: 300
  },
  '社保卡': {
    width: 358,
    height: 441,
    name: '社保卡证件照',
    dpi: 300
  },
  '学生证': {
    width: 240,
    height: 320,
    name: '学生证证件照',
    dpi: 300
  },
  '工作证': {
    width: 240,
    height: 320,
    name: '工作证证件照',
    dpi: 300
  },
  '港澳通行证': {
    width: 390,
    height: 567,
    name: '港澳通行证证件照',
    dpi: 300
  },
  '台湾通行证': {
    width: 390,
    height: 567,
    name: '台湾通行证证件照',
    dpi: 300
  }
};

// 背景颜色配置
export const BACKGROUND_COLORS: Record<string, BackgroundColor> = {
  WHITE: {
    color: '#FFFFFF',
    name: '白色'
  },
  RED: {
    color: '#FF0000',
    name: '红色'
  },
  BLUE: {
    color: '#0000FF',
    name: '蓝色'
  },
  LIGHT_BLUE: {
    color: '#87CEEB',
    name: '浅蓝色'
  },
  GRAY: {
    color: '#C0C0C0',
    name: '灰色'
  },
  LIGHT_GRAY: {
    color: '#F5F5F5',
    name: '浅灰色'
  },
  NAVY: {
    color: '#000080',
    name: '深蓝色'
  },
  GREEN: {
    color: '#008000',
    name: '绿色'
  }
};

// 图片格式配置
export const IMAGE_FORMATS = {
  JPG: {
    value: 'jpg',
    name: 'JPEG',
    mimeType: 'image/jpeg',
    extension: '.jpg'
  },
  PNG: {
    value: 'png',
    name: 'PNG',
    mimeType: 'image/png',
    extension: '.png'
  },
  WEBP: {
    value: 'webp',
    name: 'WebP',
    mimeType: 'image/webp',
    extension: '.webp'
  }
};

// 图片质量配置
export const IMAGE_QUALITY = {
  LOW: {
    value: 60,
    name: '低质量',
    description: '文件较小，适合网络传输'
  },
  MEDIUM: {
    value: 80,
    name: '中等质量',
    description: '平衡文件大小和质量'
  },
  HIGH: {
    value: 95,
    name: '高质量',
    description: '高质量，文件较大'
  },
  ORIGINAL: {
    value: 100,
    name: '原始质量',
    description: '无损压缩，文件最大'
  }
};

// 证件照模板分类
export const TEMPLATE_CATEGORIES = {
  COMMON: {
    id: 'common',
    name: '常用证件',
    icon: 'icon-common',
    order: 1
  },
  PASSPORT: {
    id: 'passport',
    name: '护照签证',
    icon: 'icon-passport',
    order: 2
  },
  EDUCATION: {
    id: 'education',
    name: '教育考试',
    icon: 'icon-education',
    order: 3
  },
  WORK: {
    id: 'work',
    name: '工作求职',
    icon: 'icon-work',
    order: 4
  },
  SOCIAL: {
    id: 'social',
    name: '社会保障',
    icon: 'icon-social',
    order: 5
  },
  OTHER: {
    id: 'other',
    name: '其他',
    icon: 'icon-other',
    order: 6
  }
};

// 错误码配置
export const ERROR_CODES = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // 业务错误
  INVALID_PARAMS: 'INVALID_PARAMS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  OPERATION_FAILED: 'OPERATION_FAILED',
  
  // 文件错误
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // 处理错误
  PROCESS_FAILED: 'PROCESS_FAILED',
  FACE_NOT_DETECTED: 'FACE_NOT_DETECTED',
  MULTIPLE_FACES: 'MULTIPLE_FACES'
};

// 文件限制配置
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_SIZE: 1024, // 1KB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  MIN_RESOLUTION: {
    width: 200,
    height: 200
  },
  MAX_RESOLUTION: {
    width: 4096,
    height: 4096
  }
};

// 默认设置
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'zh-CN',
  autoSave: true,
  imageQuality: 80,
  defaultFormat: 'jpg',
  watermark: {
    enabled: false,
    text: '松鼠证件照',
    position: 'bottom-right',
    opacity: 0.3
  }
};

// 页面路径常量
export const PAGES = {
  HOME: '/pages/index/index',
  LOGIN: '/pages/login/login',
  PROFILE: '/pages/profile/profile',
  HISTORY: '/pages/history/history',
  SETTINGS: '/pages/settings/settings',
  PHOTO_EDIT: '/pages/photo/edit',
  PHOTO_RESULT: '/pages/photo/result',
  TEMPLATE_LIST: '/pages/template/list',
  TEMPLATE_DETAIL: '/pages/template/detail'
};

// 事件名称常量
export const EVENTS = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  PHOTO_UPLOADED: 'photo:uploaded',
  PHOTO_PROCESSED: 'photo:processed',
  SETTINGS_CHANGED: 'settings:changed',
  THEME_CHANGED: 'theme:changed'
};