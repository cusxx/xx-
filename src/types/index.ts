// 用户相关类型
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  nickname?: string;
  phone?: string;
  createTime: string;
  updateTime: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

// 证件照相关类型
export interface PhotoSize {
  width: number;
  height: number;
  name: string;
  dpi?: number;
}

export interface BackgroundColor {
  color: string;
  name: string;
}

export interface PhotoTemplate {
  id: string;
  name: string;
  category: string;
  size: PhotoSize;
  backgroundColor: BackgroundColor;
  description?: string;
  preview?: string;
  isPopular?: boolean;
}

export interface PhotoProcessRequest {
  imageId: string;
  templateId?: string;
  size?: PhotoSize;
  backgroundColor?: string;
  dpi?: number;
  quality?: number;
  format?: 'jpg' | 'png';
  addWatermark?: boolean;
  cropParams?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PhotoProcessResult {
  id: string;
  originalImageId: string;
  processedImageUrl: string;
  thumbnailUrl?: string;
  size: PhotoSize;
  backgroundColor: string;
  fileSize: number;
  format: string;
  createTime: string;
  downloadCount: number;
}

export interface PhotoHistory {
  id: string;
  originalImage: {
    id: string;
    url: string;
    name: string;
    size: number;
  };
  processedImages: PhotoProcessResult[];
  createTime: string;
  updateTime: string;
}

// 上传相关类型
export interface UploadResponse {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

export interface PaginationResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 组件相关类型
export interface TabItem {
  name: string;
  label: string;
  icon?: string;
  badge?: number | string;
}

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

// 表单相关类型
export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  trigger?: 'blur' | 'change';
}

export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'upload';
  placeholder?: string;
  options?: { label: string; value: any }[];
  rules?: FormRule[];
  disabled?: boolean;
  required?: boolean;
}

// 设置相关类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  imageQuality: number;
  defaultFormat: 'jpg' | 'png';
  watermark: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
}

// 错误相关类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 事件相关类型
export interface EventBus {
  on(event: string, callback: Function): void;
  off(event: string, callback?: Function): void;
  emit(event: string, ...args: any[]): void;
}

// 导出常用类型联合
export type PhotoFormat = 'jpg' | 'png' | 'webp';
export type ImageQuality = 'low' | 'medium' | 'high' | 'original';
export type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserRole = 'user' | 'vip' | 'admin';