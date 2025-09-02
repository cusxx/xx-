import { baseUrl, timeout, enableLog } from "@/config";
import Method from "@/enums/Method";
import { Result, RequestOptions } from "@/model/Result";

// 默认请求头
const header = { "Content-Type": "application/json; charset=UTF-8" };

// 日志工具
const log = {
  info: (message: string, data?: any) => {
    if (enableLog) {
      console.log(`[REQUEST INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (enableLog) {
      console.error(`[REQUEST ERROR] ${message}`, error || '');
    }
  },
  warn: (message: string, data?: any) => {
    if (enableLog) {
      console.warn(`[REQUEST WARN] ${message}`, data || '');
    }
  }
};

// 获取token
const getToken = (): string => {
  try {
    return uni.getStorageSync('token') || '';
  } catch (error) {
    log.error('获取token失败', error);
    return '';
  }
};

// 移除token
const removeToken = (): void => {
  try {
    uni.removeStorageSync('token');
  } catch (error) {
    log.error('移除token失败', error);
  }
};

// 错误处理
const handleError = (code: number, message: string, data?: any) => {
  switch (code) {
    case 401:
      uni.showModal({
        title: '登录过期',
        content: '登录信息已过期，请重新登录',
        showCancel: false,
        success: () => {
          removeToken();
          // 跳转到登录页
          uni.reLaunch({
            url: '/pages/login/login'
          });
        }
      });
      break;
    case 403:
      uni.showToast({
        title: '权限不足',
        icon: 'none',
        duration: 2000
      });
      break;
    case 404:
      uni.showToast({
        title: '请求的资源不存在',
        icon: 'none',
        duration: 2000
      });
      break;
    case 500:
      uni.showToast({
        title: '服务器内部错误',
        icon: 'none',
        duration: 2000
      });
      break;
    default:
      uni.showToast({
        title: message || '请求失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
  }
};

const request = <T>(
  url: string,
  options: RequestOptions = { method: Method.GET }
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const { method, data, gateway, loading, headers, remoteUrl } = options;
    const tokenStr = getToken();
    const token = tokenStr ? { Authorization: `Bearer ${tokenStr}` } : {};
    const targetHeader = headers ? headers : header;
    // 远端地址 如果没有特殊指明就用baseUrl
    const targetUrl = remoteUrl ? remoteUrl : baseUrl;
    const finalUrl = gateway ? targetUrl + gateway + url : targetUrl + url;
    
    // 记录请求日志
    log.info(`发起请求: ${method} ${finalUrl}`, { data, headers: targetHeader });
    
    // 加载动画
    loading && uni.showLoading({
      title: '加载中...',
      mask: true
    });
    
    uni.request({
      url: finalUrl,
      method,
      data,
      timeout,
      header: { ...targetHeader, ...token },
      success: ({ data, statusCode }) => {
        log.info(`请求成功: ${statusCode}`, data);
        
        // 处理非200状态码
        if (statusCode !== 200) {
          log.error(`HTTP状态码错误: ${statusCode}`);
          handleError(statusCode, '网络请求失败');
          reject(new Error(`HTTP ${statusCode}`));
          return;
        }
        
        // 类型转换
        const result = data as Result<T>;
        const { code, data: resData, message } = result;
        
        // 处理业务状态码
        if (code !== undefined && code !== null && code !== 200) {
          log.error(`业务状态码错误: ${code}`, { message, data: resData });
          handleError(code, message || '未知错误');
          reject(result);
          return;
        }
        
        resolve(resData);
      },
      fail: ({ errMsg }) => {
        log.error('请求失败', errMsg);
        uni.showModal({
          title: "网络错误",
          content: "网络连接失败，请检查网络设置后重试",
          showCancel: false,
        });
        reject(new Error(errMsg));
      },
      complete: () => {
        // 关闭加载动画
        loading && uni.hideLoading();
      },
    });
  });
};

/**
 * 文件上传
 * @param url 上传路径
 * @param name 文件字段名
 * @param path 文件路径
 * @param options 请求选项
 * @returns Promise<T>
 */
export const uploadFile = <T>(
  url: string,
  name: string,
  path: string,
  options: RequestOptions = { method: Method.POST }
): Promise<T> => {
  const { data: formData, gateway, loading } = options;
  const tokenStr = getToken();
  const finalUrl = gateway ? baseUrl + gateway + url : baseUrl + url;
  
  log.info(`发起文件上传: ${finalUrl}`, { name, path, formData });
  
  // 加载动画
  loading && uni.showLoading({
    title: '上传中...',
    mask: true
  });
  
  return new Promise<T>((resolve, reject) => {
    uni.uploadFile({
      url: finalUrl,
      filePath: path,
      name: name,
      formData: formData,
      header: tokenStr ? { Authorization: `Bearer ${tokenStr}` } : {},
      success: ({ data, statusCode }) => {
        log.info(`文件上传成功: ${statusCode}`, data);
        
        try {
          // 处理非200状态码
          if (statusCode !== 200) {
            log.error(`上传HTTP状态码错误: ${statusCode}`);
            handleError(statusCode, '文件上传失败');
            reject(new Error(`HTTP ${statusCode}`));
            return;
          }
          
          const parsedData = JSON.parse(data);
          
          // 检查是否是包装格式的响应
          if (parsedData.hasOwnProperty('code') || parsedData.hasOwnProperty('data') || parsedData.hasOwnProperty('message')) {
            // 标准包装格式
            const result = parsedData as Result<T>;
            const { code, data: resData, message } = result;
            
            // 处理业务状态码
            if (code !== undefined && code !== null && code !== 200) {
              log.error(`上传业务状态码错误: ${code}`, { message, data: resData });
              handleError(code, message || '未知错误');
              reject(result);
              return;
            }
            
            resolve(resData);
          } else {
            // 直接返回数据格式（如 HivisionIDPhotos API）
            resolve(parsedData as T);
          }
        } catch (error) {
          log.error('解析上传响应失败', error);
          uni.showToast({
            title: '响应数据格式错误',
            icon: 'none',
            duration: 2000
          });
          reject(error);
        }
      },
      fail: (err) => {
        log.error('文件上传失败', err);
        uni.showModal({
          title: "上传失败",
          content: "文件上传失败，请检查网络连接后重试",
          showCancel: false,
        });
        reject(err);
      },
      complete: () => {
        // 关闭加载动画
        loading && uni.hideLoading();
      }
    });
  });
};

// 导出工具函数
export { getToken, removeToken, log };

export default request;
