import request, { uploadFile } from '@/utils/request';
import { API_ENDPOINTS } from '@/config';
import Method from '@/enums/Method';

// 用户相关API
export const userApi = {
  /**
   * 用户登录
   * @param data 登录数据
   */
  login: (data: { username: string; password: string }) => {
    return request(API_ENDPOINTS.USER.LOGIN, {
      method: Method.POST,
      data,
      loading: true
    });
  },

  /**
   * 用户注册
   * @param data 注册数据
   */
  register: (data: { username: string; password: string; email?: string }) => {
    return request(API_ENDPOINTS.USER.REGISTER, {
      method: Method.POST,
      data,
      loading: true
    });
  },

  /**
   * 获取用户信息
   */
  getProfile: () => {
    return request(API_ENDPOINTS.USER.PROFILE, {
      method: Method.GET
    });
  },

  /**
   * 更新用户信息
   * @param data 用户信息
   */
  updateProfile: (data: any) => {
    return request(API_ENDPOINTS.USER.PROFILE, {
      method: Method.PUT,
      data,
      loading: true
    });
  }
};

// 证件照相关API
export const photoApi = {
  /**
   * 上传图片
   * @param filePath 图片路径
   * @param formData 额外表单数据
   */
  upload: (filePath: string, formData?: any) => {
    return uploadFile(API_ENDPOINTS.PHOTO.UPLOAD, 'file', filePath, {
      method: Method.POST,
      data: formData,
      loading: true
    });
  },

  /**
   * 处理证件照
   * @param data 处理参数
   */
  process: (data: {
    imageId: string;
    size?: string;
    backgroundColor?: string;
    dpi?: number;
    [key: string]: any;
  }) => {
    return request(API_ENDPOINTS.PHOTO.PROCESS, {
      method: Method.POST,
      data,
      loading: true
    });
  },

  /**
   * 下载处理后的图片
   * @param imageId 图片ID
   */
  download: (imageId: string) => {
    return request(API_ENDPOINTS.PHOTO.DOWNLOAD, {
      method: Method.GET,
      data: { imageId }
    });
  },

  /**
   * 获取处理历史
   * @param page 页码
   * @param pageSize 每页数量
   */
  getHistory: (page: number = 1, pageSize: number = 10) => {
    return request(API_ENDPOINTS.PHOTO.HISTORY, {
      method: Method.GET,
      data: { page, pageSize }
    });
  },

  /**
   * 删除历史记录
   * @param imageId 图片ID
   */
  deleteHistory: (imageId: string) => {
    return request(`${API_ENDPOINTS.PHOTO.HISTORY}/${imageId}`, {
      method: Method.DELETE,
      loading: true
    });
  }
};

// 模板相关API
export const templateApi = {
  /**
   * 获取模板列表
   * @param category 模板分类
   */
  getList: (category?: string) => {
    return request(API_ENDPOINTS.TEMPLATE.LIST, {
      method: Method.GET,
      data: category ? { category } : undefined
    });
  },

  /**
   * 获取模板详情
   * @param templateId 模板ID
   */
  getDetail: (templateId: string) => {
    return request(`${API_ENDPOINTS.TEMPLATE.DETAIL}/${templateId}`, {
      method: Method.GET
    });
  }
};

// 导出所有API
export default {
  user: userApi,
  photo: photoApi,
  template: templateApi
};