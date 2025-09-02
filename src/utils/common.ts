/**
 * 复制对象属性
 * @param source 源对象
 * @param target 目标对象
 */
export const copyProperties = (source: any, target: any) => {
  const keys = Object.keys(source);
  for (let index in keys) {
    let key: keyof typeof source = keys[index];
    // 如果目标对象有该属性才设置
    if (target.hasOwnProperty(key)) target[key] = source[key];
  }
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化日期时间
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        (clonedObj as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID字符串
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 获取图片信息
 * @param src 图片路径
 * @returns Promise<{width: number, height: number}>
 */
export const getImageInfo = (src: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (res) => {
        resolve({
          width: res.width,
          height: res.height
        });
      },
      fail: reject
    });
  });
};

/**
 * 保存图片到相册
 * @param filePath 图片路径
 * @returns Promise<void>
 */
export const saveImageToPhotosAlbum = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 先检查权限
    uni.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 请求权限
          uni.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              saveImage();
            },
            fail: () => {
              uni.showModal({
                title: '提示',
                content: '需要您授权保存图片到相册',
                showCancel: false,
                success: () => {
                  uni.openSetting();
                }
              });
              reject(new Error('用户拒绝授权'));
            }
          });
        } else {
          saveImage();
        }
      }
    });

    function saveImage() {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          resolve();
        },
        fail: (err) => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    }
  });
};

/**
 * 选择图片
 * @param count 最多选择数量
 * @param sizeType 图片尺寸类型
 * @param sourceType 图片来源类型
 * @returns Promise<string[]> 图片路径数组
 */
export const chooseImage = (
  count: number = 1,
  sizeType: ('original' | 'compressed')[] = ['original', 'compressed'],
  sourceType: ('album' | 'camera')[] = ['album', 'camera']
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: (res: any) => {
        const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths].filter(Boolean);
        resolve(paths);
      },
      fail: reject
    });
  });
};

/**
 * 压缩图片
 * @param src 图片路径
 * @param quality 压缩质量 0-100
 * @returns Promise<string> 压缩后的图片路径
 */
export const compressImage = (src: string, quality: number = 80): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src,
      quality,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: reject
    });
  });
};
