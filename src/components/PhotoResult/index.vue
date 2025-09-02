<template>
  <view class="photo-result">
    <!-- 处理状态 -->
    <view v-if="processing" class="processing-status">
      <view class="processing-animation">
        <view class="spinner"></view>
      </view>
      <text class="processing-text">{{ processingText }}</text>
      <view class="processing-progress">
        <progress :percent="progress" stroke-width="4" activeColor="#007aff" />
      </view>
    </view>
    
    <!-- 处理结果 -->
    <view v-else-if="result" class="result-container">
      <!-- 结果图片对比 -->
      <view class="image-comparison">
        <view class="comparison-header">
          <text class="header-title">处理结果</text>
          <text class="header-subtitle">左右滑动查看对比效果</text>
        </view>
        
        <swiper 
          class="image-swiper"
          :indicator-dots="true"
          :autoplay="false"
          indicator-color="rgba(255, 255, 255, 0.5)"
          indicator-active-color="#007aff"
        >
          <!-- 原图 -->
          <swiper-item>
            <view class="image-item">
              <image 
                :src="originalImage" 
                mode="aspectFit"
                class="result-image"
                @click="previewImage(originalImage)"
              />
              <view class="image-label">
                <text class="label-text">原图</text>
              </view>
            </view>
          </swiper-item>
          
          <!-- 处理后的图片 -->
          <swiper-item>
            <view class="image-item">
              <image 
                :src="result.imageUrl" 
                mode="aspectFit"
                class="result-image"
                @click="previewImage(result.imageUrl)"
              />
              <view class="image-label">
                <text class="label-text">处理结果</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>
      
      <!-- 处理信息 -->
      <view class="result-info">
        <view class="info-header">
          <text class="info-title">处理信息</text>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">尺寸规格:</text>
            <text class="info-value">{{ result.size?.name || '未知' }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">图片尺寸:</text>
            <text class="info-value">{{ result.width }} × {{ result.height }} 像素</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">背景颜色:</text>
            <view class="color-info">
              <view 
                class="color-dot"
                :style="{ backgroundColor: result.backgroundColor?.value || '#FFFFFF' }"
              ></view>
              <text class="info-value">{{ result.backgroundColor?.name || '白色' }}</text>
            </view>
          </view>
          
          <view class="info-item">
            <text class="info-label">文件大小:</text>
            <text class="info-value">{{ formatFileSize(result.fileSize) }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">处理时间:</text>
            <text class="info-value">{{ formatDateTime(result.processTime) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button 
          class="action-btn action-btn--secondary"
          @click="handleReprocess"
        >
          <u-icon name="refresh" size="18" color="#606266"></u-icon>
          <text class="btn-text">重新处理</text>
        </button>
        
        <button 
          class="action-btn action-btn--primary"
          @click="handleDownload"
          :loading="downloading"
        >
          <u-icon name="download" size="18" color="#fff"></u-icon>
          <text class="btn-text">{{ downloading ? '下载中...' : '下载图片' }}</text>
        </button>
      </view>
      
      <!-- 分享按钮 -->
      <view class="share-section">
        <button 
          class="share-btn"
          @click="handleShare"
        >
          <u-icon name="share" size="18" color="#007aff"></u-icon>
          <text class="share-text">分享结果</text>
        </button>
      </view>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <view class="error-icon">
        <u-icon name="close-circle" size="48" color="#f56c6c"></u-icon>
      </view>
      
      <text class="error-title">处理失败</text>
      <text class="error-message">{{ error.message || '图片处理过程中出现错误，请重试' }}</text>
      
      <view class="error-actions">
        <button 
          class="error-btn error-btn--retry"
          @click="handleRetry"
        >
          重新处理
        </button>
        
        <button 
          class="error-btn error-btn--back"
          @click="handleBack"
        >
          返回上传
        </button>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-else class="empty-container">
      <view class="empty-icon">
        <u-icon name="image" size="48" color="#c0c4cc"></u-icon>
      </view>
      
      <text class="empty-title">暂无处理结果</text>
      <text class="empty-message">请先上传图片并进行处理</text>
    </view>
  </view>
</template>

<script>
import { formatFileSize, formatDateTime } from '@/utils/common';
import { photoApi } from '@/api';

export default {
  name: 'PhotoResult',
  
  props: {
    // 原始图片
    originalImage: {
      type: String,
      default: ''
    },
    
    // 处理结果
    result: {
      type: Object,
      default: null
    },
    
    // 是否正在处理
    processing: {
      type: Boolean,
      default: false
    },
    
    // 处理进度
    progress: {
      type: Number,
      default: 0
    },
    
    // 错误信息
    error: {
      type: Object,
      default: null
    }
  },
  
  data() {
    return {
      downloading: false,
      processingTexts: [
        '正在分析图片...',
        '正在识别人像...',
        '正在抠图处理...',
        '正在调整尺寸...',
        '正在应用背景...',
        '正在生成结果...'
      ],
      currentTextIndex: 0,
      textTimer: null
    };
  },
  
  computed: {
    processingText() {
      return this.processingTexts[this.currentTextIndex];
    }
  },
  
  watch: {
    processing: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.startProcessingAnimation();
        } else {
          this.stopProcessingAnimation();
        }
      }
    }
  },
  
  beforeDestroy() {
    this.stopProcessingAnimation();
  },
  
  methods: {
    // 格式化文件大小
    formatFileSize,
    
    // 格式化日期时间
    formatDateTime,
    
    // 开始处理动画
    startProcessingAnimation() {
      this.currentTextIndex = 0;
      this.textTimer = setInterval(() => {
        this.currentTextIndex = (this.currentTextIndex + 1) % this.processingTexts.length;
      }, 2000);
    },
    
    // 停止处理动画
    stopProcessingAnimation() {
      if (this.textTimer) {
        clearInterval(this.textTimer);
        this.textTimer = null;
      }
    },
    
    // 预览图片
    previewImage(imageUrl) {
      uni.previewImage({
        urls: [imageUrl],
        current: imageUrl
      });
    },
    
    // 重新处理
    handleReprocess() {
      this.$emit('reprocess');
    },
    
    // 下载图片
    async handleDownload() {
      if (!this.result?.imageUrl) {
        uni.showToast({
          title: '没有可下载的图片',
          icon: 'none'
        });
        return;
      }
      
      this.downloading = true;
      
      try {
        // 下载图片到本地
        const downloadResult = await uni.downloadFile({
          url: this.result.imageUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              return res.tempFilePath;
            }
            throw new Error('下载失败');
          }
        });
        
        // 保存到相册
        await uni.saveImageToPhotosAlbum({
          filePath: downloadResult.tempFilePath
        });
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 触发下载事件
        this.$emit('download', {
          url: this.result.imageUrl,
          localPath: downloadResult.tempFilePath
        });
        
      } catch (error) {
        console.error('下载失败:', error);
        
        let errorMessage = '下载失败';
        if (error.errMsg?.includes('saveImageToPhotosAlbum:fail auth deny')) {
          errorMessage = '请授权访问相册后重试';
        } else if (error.errMsg?.includes('downloadFile:fail')) {
          errorMessage = '网络错误，请检查网络连接';
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.downloading = false;
      }
    },
    
    // 分享结果
    handleShare() {
      if (!this.result?.imageUrl) {
        uni.showToast({
          title: '没有可分享的内容',
          icon: 'none'
        });
        return;
      }
      
      // #ifdef MP-WEIXIN
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      // #endif
      
      // #ifdef H5
      // H5 环境下的分享逻辑
      if (navigator.share) {
        navigator.share({
          title: '我的证件照',
          text: '使用松鼠证件照制作的专业证件照',
          url: this.result.imageUrl
        }).catch(console.error);
      } else {
        // 复制链接到剪贴板
        uni.setClipboardData({
          data: this.result.imageUrl,
          success: () => {
            uni.showToast({
              title: '链接已复制',
              icon: 'success'
            });
          }
        });
      }
      // #endif
      
      this.$emit('share', this.result);
    },
    
    // 重试处理
    handleRetry() {
      this.$emit('retry');
    },
    
    // 返回上传
    handleBack() {
      this.$emit('back');
    }
  }
};
</script>

<style lang="scss" scoped>
.photo-result {
  padding: 16px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

// 处理状态样式
.processing-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.processing-animation {
  margin-bottom: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e1e6eb;
  border-top: 4px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-text {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
}

.processing-progress {
  width: 200px;
}

// 结果容器样式
.result-container {
  // 样式已在子元素中定义
}

.image-comparison {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comparison-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.header-subtitle {
  display: block;
  font-size: 14px;
  color: #909399;
}

.image-swiper {
  height: 400px;
}

.image-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.result-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-label {
  position: absolute;
  top: 16px;
  left: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 16px;
}

.label-text {
  font-size: 12px;
  color: #fff;
}

// 信息样式
.result-info {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-header {
  margin-bottom: 16px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-list {
  // 样式已在 info-item 中定义
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  color: #606266;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
}

// 操作按钮样式
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &--primary {
    background-color: #007aff;
    color: #fff;
  }
  
  &--secondary {
    background-color: #f5f7fa;
    color: #606266;
    border: 1px solid #dcdfe6;
  }
}

.btn-text {
  font-size: 16px;
}

// 分享样式
.share-section {
  text-align: center;
}

.share-btn {
  background: none;
  border: none;
  color: #007aff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  
  &:active {
    opacity: 0.7;
  }
}

.share-text {
  font-size: 16px;
}

// 错误状态样式
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.error-icon {
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.error-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
  
  &--retry {
    background-color: #007aff;
    color: #fff;
  }
  
  &--back {
    background-color: #f5f7fa;
    color: #606266;
    border: 1px solid #dcdfe6;
  }
}

// 空状态样式
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  color: #909399;
  margin-bottom: 8px;
}

.empty-message {
  font-size: 14px;
  color: #c0c4cc;
}
</style>