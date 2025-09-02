<template>
  <view class="size-selector">
    <!-- 标题 -->
    <view class="selector-header">
      <text class="header-title">选择证件照尺寸</text>
      <text class="header-subtitle">请选择您需要的证件照规格</text>
    </view>
    
    <!-- 分类标签 -->
    <view class="category-tabs">
      <view 
        v-for="category in categories" 
        :key="category.id"
        class="category-tab"
        :class="{ 'category-tab--active': activeCategory === category.id }"
        @click="handleCategoryChange(category.id)"
      >
        <text class="tab-text">{{ category.name }}</text>
      </view>
    </view>
    
    <!-- 尺寸列表 -->
    <view class="size-list">
      <view 
        v-for="size in filteredSizes" 
        :key="size.key"
        class="size-item"
        :class="{ 'size-item--active': selectedSize?.key === size.key }"
        @click="handleSizeSelect(size)"
      >
        <view class="size-info">
          <text class="size-name">{{ size.name }}</text>
          <text class="size-dimensions">{{ size.width }} × {{ size.height }} 像素</text>
          <text v-if="size.dpi" class="size-dpi">{{ size.dpi }} DPI</text>
        </view>
        
        <view class="size-preview">
          <view 
            class="preview-rect"
            :style="getPreviewStyle(size)"
          ></view>
        </view>
        
        <view v-if="selectedSize?.key === size.key" class="size-check">
          <u-icon name="checkmark" size="20" color="#007aff"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 自定义尺寸 -->
    <view class="custom-size">
      <view class="custom-header" @click="showCustom = !showCustom">
        <text class="custom-title">自定义尺寸</text>
        <u-icon 
          :name="showCustom ? 'arrow-up' : 'arrow-down'" 
          size="16" 
          color="#909399"
        ></u-icon>
      </view>
      
      <view v-if="showCustom" class="custom-form">
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">宽度</text>
            <input 
              v-model.number="customSize.width"
              type="number"
              placeholder="像素"
              class="form-input"
              @input="handleCustomSizeChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">高度</text>
            <input 
              v-model.number="customSize.height"
              type="number"
              placeholder="像素"
              class="form-input"
              @input="handleCustomSizeChange"
            />
          </view>
        </view>
        
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">DPI</text>
            <input 
              v-model.number="customSize.dpi"
              type="number"
              placeholder="300"
              class="form-input"
              @input="handleCustomSizeChange"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">名称</text>
            <input 
              v-model="customSize.name"
              type="text"
              placeholder="自定义尺寸"
              class="form-input"
              @input="handleCustomSizeChange"
            />
          </view>
        </view>
        
        <view class="custom-actions">
          <button 
            class="custom-btn custom-btn--apply"
            :disabled="!isCustomSizeValid"
            @click="handleApplyCustomSize"
          >
            应用自定义尺寸
          </button>
        </view>
      </view>
    </view>
    
    <!-- 选中的尺寸信息 -->
    <view v-if="selectedSize" class="selected-info">
      <view class="info-header">
        <text class="info-title">已选择尺寸</text>
      </view>
      
      <view class="info-content">
        <view class="info-item">
          <text class="info-label">名称:</text>
          <text class="info-value">{{ selectedSize.name }}</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">尺寸:</text>
          <text class="info-value">{{ selectedSize.width }} × {{ selectedSize.height }} 像素</text>
        </view>
        
        <view v-if="selectedSize.dpi" class="info-item">
          <text class="info-label">分辨率:</text>
          <text class="info-value">{{ selectedSize.dpi }} DPI</text>
        </view>
        
        <view class="info-item">
          <text class="info-label">比例:</text>
          <text class="info-value">{{ getSizeRatio(selectedSize) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { PHOTO_SIZES, TEMPLATE_CATEGORIES } from '@/constants';

export default {
  name: 'SizeSelector',
  
  props: {
    // 当前选中的尺寸
    value: {
      type: Object,
      default: null
    },
    
    // 是否显示分类
    showCategory: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      activeCategory: 'common',
      selectedSize: null,
      showCustom: false,
      customSize: {
        width: '',
        height: '',
        dpi: 300,
        name: '自定义尺寸'
      },
      
      // 分类配置
      categories: [
        { id: 'common', name: '常用' },
        { id: 'passport', name: '护照' },
        { id: 'education', name: '教育' },
        { id: 'work', name: '工作' },
        { id: 'other', name: '其他' }
      ],
      
      // 尺寸分类映射
      sizeCategories: {
        '1寸': 'common',
        '2寸': 'common',
        '小1寸': 'common',
        '小2寸': 'common',
        '护照': 'passport',
        '签证': 'passport',
        '港澳通行证': 'passport',
        '台湾通行证': 'passport',
        '驾驶证': 'work',
        '身份证': 'work',
        '社保卡': 'work',
        '工作证': 'work',
        '学生证': 'education'
      }
    };
  },
  
  computed: {
    // 所有尺寸列表
    allSizes() {
      return Object.keys(PHOTO_SIZES).map(key => ({
        key,
        ...PHOTO_SIZES[key],
        category: this.sizeCategories[key] || 'other'
      }));
    },
    
    // 过滤后的尺寸列表
    filteredSizes() {
      if (!this.showCategory) {
        return this.allSizes;
      }
      
      return this.allSizes.filter(size => 
        size.category === this.activeCategory
      );
    },
    
    // 自定义尺寸是否有效
    isCustomSizeValid() {
      return this.customSize.width > 0 && 
             this.customSize.height > 0 && 
             this.customSize.name.trim();
    }
  },
  
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.selectedSize = newVal;
      }
    }
  },
  
  methods: {
    // 切换分类
    handleCategoryChange(categoryId) {
      this.activeCategory = categoryId;
    },
    
    // 选择尺寸
    handleSizeSelect(size) {
      this.selectedSize = size;
      this.$emit('input', size);
      this.$emit('change', size);
    },
    
    // 自定义尺寸变化
    handleCustomSizeChange() {
      // 实时验证
      this.$nextTick(() => {
        // 可以在这里添加实时验证逻辑
      });
    },
    
    // 应用自定义尺寸
    handleApplyCustomSize() {
      if (!this.isCustomSizeValid) {
        uni.showToast({
          title: '请填写完整的尺寸信息',
          icon: 'none'
        });
        return;
      }
      
      const customSizeData = {
        key: 'custom',
        name: this.customSize.name,
        width: this.customSize.width,
        height: this.customSize.height,
        dpi: this.customSize.dpi || 300,
        category: 'custom'
      };
      
      this.handleSizeSelect(customSizeData);
      this.showCustom = false;
      
      uni.showToast({
        title: '自定义尺寸已应用',
        icon: 'success'
      });
    },
    
    // 获取预览样式
    getPreviewStyle(size) {
      const maxWidth = 40;
      const maxHeight = 40;
      const ratio = size.width / size.height;
      
      let width, height;
      
      if (ratio > 1) {
        // 宽度大于高度
        width = maxWidth;
        height = maxWidth / ratio;
      } else {
        // 高度大于宽度
        height = maxHeight;
        width = maxHeight * ratio;
      }
      
      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#e1f5fe',
        border: '1px solid #81d4fa'
      };
    },
    
    // 获取尺寸比例
    getSizeRatio(size) {
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(size.width, size.height);
      const ratioW = size.width / divisor;
      const ratioH = size.height / divisor;
      return `${ratioW}:${ratioH}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.size-selector {
  padding: 16px;
}

.selector-header {
  margin-bottom: 20px;
  text-align: center;
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

.category-tabs {
  display: flex;
  margin-bottom: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
}

.category-tab {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  
  &--active {
    background-color: #007aff;
    
    .tab-text {
      color: #fff;
    }
  }
}

.tab-text {
  font-size: 14px;
  color: #606266;
  transition: color 0.3s;
}

.size-list {
  margin-bottom: 20px;
}

.size-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &--active {
    border-color: #007aff;
    background-color: #f0f9ff;
  }
}

.size-info {
  flex: 1;
}

.size-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.size-dimensions {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 2px;
}

.size-dpi {
  display: block;
  font-size: 12px;
  color: #909399;
}

.size-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 16px;
}

.preview-rect {
  border-radius: 2px;
}

.size-check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-size {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.custom-form {
  padding: 16px;
  background-color: #fff;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-item {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  
  &:focus {
    border-color: #007aff;
    outline: none;
  }
}

.custom-actions {
  margin-top: 16px;
}

.custom-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  
  &--apply {
    background-color: #007aff;
    color: #fff;
    
    &:disabled {
      background-color: #c0c4cc;
      color: #fff;
    }
    
    &:not(:disabled):active {
      transform: scale(0.98);
    }
  }
}

.selected-info {
  padding: 16px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
}

.info-header {
  margin-bottom: 12px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #007aff;
}

.info-content {
  // 样式已在 info-item 中定义
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
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