<template>
  <view class="background-selector">
    <!-- 标题 -->
    <view class="selector-header">
      <text class="header-title">选择背景颜色</text>
      <text class="header-subtitle">请选择证件照的背景颜色</text>
    </view>
    
    <!-- 预设颜色 -->
    <view class="preset-colors">
      <view class="color-grid">
        <view 
          v-for="color in presetColors" 
          :key="color.key"
          class="color-item"
          :class="{ 'color-item--active': selectedColor?.key === color.key }"
          @click="handleColorSelect(color)"
        >
          <view 
            class="color-preview"
            :style="{ backgroundColor: color.value }"
          >
            <view v-if="selectedColor?.key === color.key" class="color-check">
              <u-icon name="checkmark" size="16" color="#fff"></u-icon>
            </view>
          </view>
          
          <text class="color-name">{{ color.name }}</text>
          <text class="color-value">{{ color.value }}</text>
        </view>
      </view>
    </view>
    
    <!-- 自定义颜色 -->
    <view class="custom-color">
      <view class="custom-header" @click="showCustom = !showCustom">
        <text class="custom-title">自定义颜色</text>
        <u-icon 
          :name="showCustom ? 'arrow-up' : 'arrow-down'" 
          size="16" 
          color="#909399"
        ></u-icon>
      </view>
      
      <view v-if="showCustom" class="custom-form">
        <!-- 颜色选择器 -->
        <view class="color-picker-section">
          <text class="section-title">颜色选择</text>
          
          <view class="picker-container">
            <view 
              class="color-display"
              :style="{ backgroundColor: customColor.value }"
              @click="openColorPicker"
            >
              <text class="picker-hint">点击选择颜色</text>
            </view>
            
            <view class="color-input-group">
              <view class="input-item">
                <text class="input-label">HEX</text>
                <input 
                  v-model="customColor.hex"
                  type="text"
                  placeholder="#FFFFFF"
                  class="color-input"
                  @input="handleHexChange"
                />
              </view>
              
              <view class="input-item">
                <text class="input-label">RGB</text>
                <input 
                  v-model="customColor.rgb"
                  type="text"
                  placeholder="255,255,255"
                  class="color-input"
                  @input="handleRgbChange"
                />
              </view>
            </view>
          </view>
        </view>
        
        <!-- RGB 滑块 -->
        <view class="rgb-sliders">
          <view class="slider-item">
            <text class="slider-label">红色 ({{ customColor.r }})</text>
            <slider 
              :value="customColor.r"
              min="0"
              max="255"
              activeColor="#ff4757"
              backgroundColor="#f1f2f6"
              @change="handleRgbSliderChange('r', $event)"
            />
          </view>
          
          <view class="slider-item">
            <text class="slider-label">绿色 ({{ customColor.g }})</text>
            <slider 
              :value="customColor.g"
              min="0"
              max="255"
              activeColor="#2ed573"
              backgroundColor="#f1f2f6"
              @change="handleRgbSliderChange('g', $event)"
            />
          </view>
          
          <view class="slider-item">
            <text class="slider-label">蓝色 ({{ customColor.b }})</text>
            <slider 
              :value="customColor.b"
              min="0"
              max="255"
              activeColor="#3742fa"
              backgroundColor="#f1f2f6"
              @change="handleRgbSliderChange('b', $event)"
            />
          </view>
        </view>
        
        <!-- 常用自定义颜色 -->
        <view v-if="recentColors.length > 0" class="recent-colors">
          <text class="section-title">最近使用</text>
          <view class="recent-grid">
            <view 
              v-for="(color, index) in recentColors" 
              :key="index"
              class="recent-item"
              :style="{ backgroundColor: color }"
              @click="handleRecentColorSelect(color)"
            ></view>
          </view>
        </view>
        
        <!-- 自定义颜色名称 -->
        <view class="custom-name">
          <text class="input-label">颜色名称</text>
          <input 
            v-model="customColor.name"
            type="text"
            placeholder="自定义颜色"
            class="name-input"
          />
        </view>
        
        <view class="custom-actions">
          <button 
            class="custom-btn custom-btn--apply"
            :disabled="!isCustomColorValid"
            @click="handleApplyCustomColor"
          >
            应用自定义颜色
          </button>
        </view>
      </view>
    </view>
    
    <!-- 选中的颜色信息 -->
    <view v-if="selectedColor" class="selected-info">
      <view class="info-header">
        <text class="info-title">已选择颜色</text>
      </view>
      
      <view class="info-content">
        <view class="info-preview">
          <view 
            class="preview-color"
            :style="{ backgroundColor: selectedColor.value }"
          ></view>
          
          <view class="preview-details">
            <view class="info-item">
              <text class="info-label">名称:</text>
              <text class="info-value">{{ selectedColor.name }}</text>
            </view>
            
            <view class="info-item">
              <text class="info-label">颜色值:</text>
              <text class="info-value">{{ selectedColor.value }}</text>
            </view>
            
            <view v-if="selectedColor.rgb" class="info-item">
              <text class="info-label">RGB:</text>
              <text class="info-value">{{ selectedColor.rgb }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { BACKGROUND_COLORS, STORAGE_KEYS } from '@/constants';

export default {
  name: 'BackgroundSelector',
  
  props: {
    // 当前选中的颜色
    value: {
      type: Object,
      default: null
    }
  },
  
  data() {
    return {
      selectedColor: null,
      showCustom: false,
      customColor: {
        name: '自定义颜色',
        value: '#FFFFFF',
        hex: '#FFFFFF',
        rgb: '255,255,255',
        r: 255,
        g: 255,
        b: 255
      },
      recentColors: []
    };
  },
  
  computed: {
    // 预设颜色列表
    presetColors() {
      return Object.keys(BACKGROUND_COLORS).map(key => ({
        key,
        ...BACKGROUND_COLORS[key]
      }));
    },
    
    // 自定义颜色是否有效
    isCustomColorValid() {
      return this.customColor.name.trim() && 
             this.isValidHex(this.customColor.hex);
    }
  },
  
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.selectedColor = newVal;
      }
    }
  },
  
  mounted() {
    this.loadRecentColors();
  },
  
  methods: {
    // 选择颜色
    handleColorSelect(color) {
      this.selectedColor = color;
      this.$emit('input', color);
      this.$emit('change', color);
    },
    
    // 打开颜色选择器（系统原生）
    openColorPicker() {
      // 注意：uni-app 中没有原生颜色选择器，这里可以集成第三方组件
      // 或者使用 H5 的 input[type="color"]
      uni.showToast({
        title: '请使用下方滑块或输入框选择颜色',
        icon: 'none'
      });
    },
    
    // HEX 颜色变化
    handleHexChange() {
      const hex = this.customColor.hex;
      if (this.isValidHex(hex)) {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
          this.customColor.r = rgb.r;
          this.customColor.g = rgb.g;
          this.customColor.b = rgb.b;
          this.customColor.rgb = `${rgb.r},${rgb.g},${rgb.b}`;
          this.customColor.value = hex;
        }
      }
    },
    
    // RGB 颜色变化
    handleRgbChange() {
      const rgbStr = this.customColor.rgb;
      const rgbMatch = rgbStr.match(/^(\d+),\s*(\d+),\s*(\d+)$/);
      
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
          this.customColor.r = r;
          this.customColor.g = g;
          this.customColor.b = b;
          this.customColor.hex = this.rgbToHex(r, g, b);
          this.customColor.value = this.customColor.hex;
        }
      }
    },
    
    // RGB 滑块变化
    handleRgbSliderChange(component, event) {
      const value = event.detail.value;
      this.customColor[component] = value;
      
      const { r, g, b } = this.customColor;
      this.customColor.hex = this.rgbToHex(r, g, b);
      this.customColor.rgb = `${r},${g},${b}`;
      this.customColor.value = this.customColor.hex;
    },
    
    // 选择最近使用的颜色
    handleRecentColorSelect(color) {
      this.customColor.value = color;
      this.customColor.hex = color;
      
      const rgb = this.hexToRgb(color);
      if (rgb) {
        this.customColor.r = rgb.r;
        this.customColor.g = rgb.g;
        this.customColor.b = rgb.b;
        this.customColor.rgb = `${rgb.r},${rgb.g},${rgb.b}`;
      }
    },
    
    // 应用自定义颜色
    handleApplyCustomColor() {
      if (!this.isCustomColorValid) {
        uni.showToast({
          title: '请输入有效的颜色值',
          icon: 'none'
        });
        return;
      }
      
      const customColorData = {
        key: 'custom',
        name: this.customColor.name,
        value: this.customColor.value,
        rgb: this.customColor.rgb
      };
      
      this.handleColorSelect(customColorData);
      this.addToRecentColors(this.customColor.value);
      this.showCustom = false;
      
      uni.showToast({
        title: '自定义颜色已应用',
        icon: 'success'
      });
    },
    
    // 验证 HEX 颜色
    isValidHex(hex) {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    },
    
    // HEX 转 RGB
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    // RGB 转 HEX
    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    },
    
    // 添加到最近使用
    addToRecentColors(color) {
      const index = this.recentColors.indexOf(color);
      if (index > -1) {
        this.recentColors.splice(index, 1);
      }
      
      this.recentColors.unshift(color);
      
      // 最多保存 8 个最近使用的颜色
      if (this.recentColors.length > 8) {
        this.recentColors = this.recentColors.slice(0, 8);
      }
      
      this.saveRecentColors();
    },
    
    // 加载最近使用的颜色
    loadRecentColors() {
      try {
        const stored = uni.getStorageSync(STORAGE_KEYS.RECENT_COLORS);
        if (stored) {
          this.recentColors = JSON.parse(stored);
        }
      } catch (error) {
        console.error('加载最近使用颜色失败:', error);
      }
    },
    
    // 保存最近使用的颜色
    saveRecentColors() {
      try {
        uni.setStorageSync(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(this.recentColors));
      } catch (error) {
        console.error('保存最近使用颜色失败:', error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.background-selector {
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

.preset-colors {
  margin-bottom: 20px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
  
  &--active {
    border-color: #007aff;
    background-color: #f0f9ff;
  }
}

.color-preview {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.color-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 2px;
  text-align: center;
}

.color-value {
  font-size: 10px;
  color: #909399;
  text-align: center;
}

.custom-color {
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

.color-picker-section {
  margin-bottom: 20px;
}

.section-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.picker-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.color-display {
  width: 80px;
  height: 80px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:active {
    transform: scale(0.95);
  }
}

.picker-hint {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.5);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 4px;
  border-radius: 4px;
}

.color-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-item {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.color-input {
  height: 36px;
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

.rgb-sliders {
  margin-bottom: 20px;
}

.slider-item {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.slider-label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.recent-colors {
  margin-bottom: 20px;
}

.recent-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.recent-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.9);
  }
}

.custom-name {
  margin-bottom: 16px;
}

.name-input {
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
  // 样式已在 custom-btn 中定义
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
  // 样式已在子元素中定义
}

.info-preview {
  display: flex;
  gap: 16px;
  align-items: center;
}

.preview-color {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-details {
  flex: 1;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  
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