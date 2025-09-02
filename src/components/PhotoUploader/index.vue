<template>
  <view class="photo-uploader">
    <!-- 上传区域 -->
    <view 
      class="upload-area" 
      :class="{ 'upload-area--active': isDragOver, 'upload-area--disabled': disabled }"
      @click="handleUploadClick"
    >
      <view v-if="!imageUrl" class="upload-placeholder">
        <u-icon name="camera" size="60" color="#c0c4cc"></u-icon>
        <text class="upload-text">{{ placeholder }}</text>
        <text class="upload-tips">{{ tips }}</text>
      </view>
      
      <!-- 预览图片 -->
      <view v-else class="image-preview">
        <image 
          :src="imageUrl" 
          mode="aspectFit" 
          class="preview-image"
          @click.stop="handlePreview"
        />
        
        <!-- 操作按钮 -->
        <view class="image-actions">
          <view class="action-btn" @click.stop="handleReupload">
            <u-icon name="camera" size="20" color="#fff"></u-icon>
          </view>
          <view class="action-btn" @click.stop="handleDelete">
            <u-icon name="trash" size="20" color="#fff"></u-icon>
          </view>
        </view>
        
        <!-- 上传进度 -->
        <view v-if="uploading" class="upload-progress">
          <u-line-progress 
            :percent="uploadProgress" 
            :show-percent="false"
            height="4"
            active-color="#007aff"
          ></u-line-progress>
          <text class="progress-text">{{ uploadProgress }}%</text>
        </view>
      </view>
    </view>
    
    <!-- 图片信息 -->
    <view v-if="imageInfo && showInfo" class="image-info">
      <view class="info-item">
        <text class="info-label">尺寸:</text>
        <text class="info-value">{{ imageInfo.width }} × {{ imageInfo.height }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">大小:</text>
        <text class="info-value">{{ formatFileSize(imageInfo.size) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { chooseImage, getImageInfo, formatFileSize, compressImage } from '@/utils/common';
import { photoApi } from '@/api';

export default {
  name: 'PhotoUploader',
  
  props: {
    // 图片地址
    value: {
      type: String,
      default: ''
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    
    // 占位符文本
    placeholder: {
      type: String,
      default: '点击上传图片'
    },
    
    // 提示文本
    tips: {
      type: String,
      default: '支持 JPG、PNG 格式，建议尺寸不小于 300×400'
    },
    
    // 是否显示图片信息
    showInfo: {
      type: Boolean,
      default: true
    },
    
    // 是否自动压缩
    autoCompress: {
      type: Boolean,
      default: true
    },
    
    // 压缩质量
    quality: {
      type: Number,
      default: 80
    },
    
    // 最大文件大小（字节）
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    
    // 允许的文件类型
    accept: {
      type: Array,
      default: () => ['jpg', 'jpeg', 'png']
    }
  },
  
  data() {
    return {
      imageUrl: '',
      imageInfo: null,
      uploading: false,
      uploadProgress: 0,
      isDragOver: false
    };
  },
  
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.imageUrl = newVal;
        if (newVal) {
          this.getImageInfo(newVal);
        }
      }
    }
  },
  
  methods: {
    // 处理上传点击
    async handleUploadClick() {
      if (this.disabled || this.uploading) return;
      
      try {
        const imagePaths = await chooseImage(1, ['original', 'compressed'], ['album', 'camera']);
        const imagePath = imagePaths[0];
        
        // 验证文件
        const isValid = await this.validateFile(imagePath);
        if (!isValid) return;
        
        // 压缩图片
        let finalPath = imagePath;
        if (this.autoCompress) {
          finalPath = await compressImage(imagePath, this.quality);
        }
        
        // 上传图片
        await this.uploadImage(finalPath);
        
      } catch (error) {
        console.error('选择图片失败:', error);
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    },
    
    // 验证文件
    async validateFile(filePath) {
      try {
        const imageInfo = await getImageInfo(filePath);
        
        // 检查文件大小
        if (imageInfo.size && imageInfo.size > this.maxSize) {
          uni.showToast({
            title: `文件大小不能超过 ${formatFileSize(this.maxSize)}`,
            icon: 'none'
          });
          return false;
        }
        
        // 检查图片尺寸
        if (imageInfo.width < 200 || imageInfo.height < 200) {
          uni.showToast({
            title: '图片尺寸过小，建议不小于 200×200',
            icon: 'none'
          });
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('验证文件失败:', error);
        uni.showToast({
          title: '文件验证失败',
          icon: 'none'
        });
        return false;
      }
    },
    
    // 上传图片
    async uploadImage(filePath) {
      this.uploading = true;
      this.uploadProgress = 0;
      
      try {
        // 模拟上传进度
        const progressTimer = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += Math.random() * 20;
          }
        }, 200);
        
        const result = await photoApi.upload(filePath);
        
        clearInterval(progressTimer);
        this.uploadProgress = 100;
        
        // 设置图片URL
        this.imageUrl = result.url;
        this.imageInfo = {
          width: result.width,
          height: result.height,
          size: result.size
        };
        
        // 触发change事件
        this.$emit('input', result.url);
        this.$emit('change', result);
        
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('上传失败:', error);
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
        this.$emit('error', error);
      } finally {
        this.uploading = false;
        setTimeout(() => {
          this.uploadProgress = 0;
        }, 1000);
      }
    },
    
    // 获取图片信息
    async getImageInfo(src) {
      try {
        const info = await getImageInfo(src);
        this.imageInfo = info;
      } catch (error) {
        console.error('获取图片信息失败:', error);
      }
    },
    
    // 预览图片
    handlePreview() {
      if (!this.imageUrl) return;
      
      uni.previewImage({
        urls: [this.imageUrl],
        current: this.imageUrl
      });
    },
    
    // 重新上传
    handleReupload() {
      this.handleUploadClick();
    },
    
    // 删除图片
    handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.imageUrl = '';
            this.imageInfo = null;
            this.$emit('input', '');
            this.$emit('delete');
          }
        }
      });
    },
    
    // 格式化文件大小
    formatFileSize
  }
};
</script>

<style lang="scss" scoped>
.photo-uploader {
  width: 100%;
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &--active {
    border-color: #007aff;
    background-color: #f0f9ff;
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
}

.upload-text {
  margin-top: 16px;
  font-size: 16px;
  color: #606266;
}

.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: center;
  line-height: 1.4;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.9);
  }
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0 0 8px 8px;
}

.progress-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #fff;
  text-align: center;
}

.image-info {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
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
</style>