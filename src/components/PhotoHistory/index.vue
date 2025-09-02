<template>
  <view class="photo-history">
    <!-- 头部 -->
    <view class="history-header">
      <text class="header-title">处理历史</text>
      <view class="header-actions">
        <button 
          v-if="historyList.length > 0"
          class="action-btn"
          @click="handleClearAll"
        >
          <u-icon name="trash" size="16" color="#f56c6c"></u-icon>
          <text class="action-text">清空</text>
        </button>
      </view>
    </view>
    
    <!-- 筛选器 -->
    <view v-if="historyList.length > 0" class="filter-section">
      <view class="filter-tabs">
        <view 
          v-for="filter in filterOptions" 
          :key="filter.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeFilter === filter.value }"
          @click="handleFilterChange(filter.value)"
        >
          <text class="tab-text">{{ filter.label }}</text>
        </view>
      </view>
      
      <view class="sort-section">
        <view class="sort-btn" @click="toggleSortOrder">
          <u-icon 
            :name="sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'" 
            size="14" 
            color="#909399"
          ></u-icon>
          <text class="sort-text">{{ sortOrder === 'desc' ? '最新' : '最早' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 历史列表 -->
    <view v-if="filteredHistory.length > 0" class="history-list">
      <view 
        v-for="item in filteredHistory" 
        :key="item.id"
        class="history-item"
        @click="handleItemClick(item)"
      >
        <!-- 图片预览 -->
        <view class="item-image">
          <image 
            :src="item.thumbnailUrl || item.resultUrl" 
            mode="aspectFill"
            class="thumbnail"
            @error="handleImageError"
          />
          
          <!-- 状态标识 -->
          <view v-if="item.status !== 'completed'" class="status-badge">
            <text class="status-text">
              {{ getStatusText(item.status) }}
            </text>
          </view>
        </view>
        
        <!-- 信息内容 -->
        <view class="item-content">
          <view class="content-header">
            <text class="item-title">{{ item.sizeName || '证件照' }}</text>
            <text class="item-time">{{ formatRelativeTime(item.createTime) }}</text>
          </view>
          
          <view class="content-details">
            <view class="detail-item">
              <text class="detail-label">尺寸:</text>
              <text class="detail-value">{{ item.width }} × {{ item.height }}</text>
            </view>
            
            <view class="detail-item">
              <text class="detail-label">背景:</text>
              <view class="background-info">
                <view 
                  class="bg-color-dot"
                  :style="{ backgroundColor: item.backgroundColor || '#FFFFFF' }"
                ></view>
                <text class="detail-value">{{ item.backgroundName || '白色' }}</text>
              </view>
            </view>
          </view>
          
          <view v-if="item.status === 'completed'" class="content-footer">
            <text class="file-size">{{ formatFileSize(item.fileSize) }}</text>
            <text class="process-time">耗时 {{ item.processTime }}s</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="item-actions">
          <view 
            v-if="item.status === 'completed'"
            class="action-icon"
            @click.stop="handleDownload(item)"
          >
            <u-icon name="download" size="20" color="#007aff"></u-icon>
          </view>
          
          <view 
            class="action-icon"
            @click.stop="handleDelete(item)"
          >
            <u-icon name="trash" size="20" color="#f56c6c"></u-icon>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <view v-if="hasMore && filteredHistory.length > 0" class="load-more">
      <button 
        class="load-more-btn"
        :loading="loading"
        @click="handleLoadMore"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </view>
    
    <!-- 空状态 -->
    <view v-if="filteredHistory.length === 0 && !loading" class="empty-state">
      <view class="empty-icon">
        <u-icon name="clock" size="48" color="#c0c4cc"></u-icon>
      </view>
      
      <text class="empty-title">
        {{ activeFilter === 'all' ? '暂无处理历史' : '暂无相关记录' }}
      </text>
      
      <text class="empty-message">
        {{ activeFilter === 'all' ? '开始制作您的第一张证件照吧' : '尝试切换其他筛选条件' }}
      </text>
      
      <button 
        v-if="activeFilter === 'all'"
        class="empty-btn"
        @click="handleStartCreate"
      >
        开始制作
      </button>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading && filteredHistory.length === 0" class="loading-state">
      <view class="loading-spinner">
        <view class="spinner"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { formatFileSize, formatDateTime } from '@/utils/common';
import { photoApi } from '@/api';

export default {
  name: 'PhotoHistory',
  
  props: {
    // 是否显示头部
    showHeader: {
      type: Boolean,
      default: true
    },
    
    // 每页数量
    pageSize: {
      type: Number,
      default: 10
    }
  },
  
  data() {
    return {
      historyList: [],
      loading: false,
      hasMore: true,
      currentPage: 1,
      activeFilter: 'all',
      sortOrder: 'desc', // desc: 最新, asc: 最早
      
      // 筛选选项
      filterOptions: [
        { label: '全部', value: 'all' },
        { label: '已完成', value: 'completed' },
        { label: '处理中', value: 'processing' },
        { label: '失败', value: 'failed' }
      ]
    };
  },
  
  computed: {
    // 过滤后的历史记录
    filteredHistory() {
      let filtered = this.historyList;
      
      // 状态筛选
      if (this.activeFilter !== 'all') {
        filtered = filtered.filter(item => item.status === this.activeFilter);
      }
      
      // 排序
      filtered = filtered.sort((a, b) => {
        const timeA = new Date(a.createTime).getTime();
        const timeB = new Date(b.createTime).getTime();
        
        return this.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
      
      return filtered;
    }
  },
  
  mounted() {
    this.loadHistory();
  },
  
  methods: {
    // 格式化文件大小
    formatFileSize,
    
    // 加载历史记录
    async loadHistory(refresh = false) {
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        const params = {
          page: refresh ? 1 : this.currentPage,
          pageSize: this.pageSize
        };
        
        const response = await photoApi.getHistory(params);
        
        if (refresh) {
          this.historyList = response.data.list;
          this.currentPage = 1;
        } else {
          this.historyList.push(...response.data.list);
        }
        
        this.hasMore = response.data.hasMore;
        this.currentPage++;
        
      } catch (error) {
        console.error('加载历史记录失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载更多
    handleLoadMore() {
      this.loadHistory();
    },
    
    // 筛选变化
    handleFilterChange(filter) {
      this.activeFilter = filter;
    },
    
    // 切换排序
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    },
    
    // 点击历史项
    handleItemClick(item) {
      this.$emit('item-click', item);
      
      // 如果是已完成的项目，可以预览
      if (item.status === 'completed' && item.resultUrl) {
        uni.previewImage({
          urls: [item.resultUrl],
          current: item.resultUrl
        });
      }
    },
    
    // 下载图片
    async handleDownload(item) {
      if (!item.resultUrl) {
        uni.showToast({
          title: '图片不存在',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '下载中...'
      });
      
      try {
        // 下载图片
        const downloadResult = await uni.downloadFile({
          url: item.resultUrl
        });
        
        if (downloadResult.statusCode === 200) {
          // 保存到相册
          await uni.saveImageToPhotosAlbum({
            filePath: downloadResult.tempFilePath
          });
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          this.$emit('download', item);
        } else {
          throw new Error('下载失败');
        }
        
      } catch (error) {
        console.error('下载失败:', error);
        
        let errorMessage = '下载失败';
        if (error.errMsg?.includes('saveImageToPhotosAlbum:fail auth deny')) {
          errorMessage = '请授权访问相册后重试';
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 删除单个记录
    async handleDelete(item) {
      const result = await uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？删除后无法恢复。',
        confirmText: '删除',
        confirmColor: '#f56c6c'
      });
      
      if (!result.confirm) return;
      
      try {
        await photoApi.deleteHistory(item.id);
        
        // 从列表中移除
        const index = this.historyList.findIndex(h => h.id === item.id);
        if (index > -1) {
          this.historyList.splice(index, 1);
        }
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        this.$emit('delete', item);
        
      } catch (error) {
        console.error('删除失败:', error);
        uni.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 清空所有记录
    async handleClearAll() {
      const result = await uni.showModal({
        title: '确认清空',
        content: '确定要清空所有历史记录吗？此操作无法恢复。',
        confirmText: '清空',
        confirmColor: '#f56c6c'
      });
      
      if (!result.confirm) return;
      
      try {
        await photoApi.clearHistory();
        
        this.historyList = [];
        this.hasMore = false;
        this.currentPage = 1;
        
        uni.showToast({
          title: '清空成功',
          icon: 'success'
        });
        
        this.$emit('clear');
        
      } catch (error) {
        console.error('清空失败:', error);
        uni.showToast({
          title: '清空失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 开始制作
    handleStartCreate() {
      this.$emit('start-create');
    },
    
    // 图片加载错误
    handleImageError(e) {
      console.warn('图片加载失败:', e);
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        processing: '处理中',
        completed: '已完成',
        failed: '失败'
      };
      return statusMap[status] || '未知';
    },
    
    // 格式化相对时间
    formatRelativeTime(time) {
      const now = new Date();
      const target = new Date(time);
      const diff = now.getTime() - target.getTime();
      
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      const month = 30 * day;
      
      if (diff < minute) {
        return '刚刚';
      } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`;
      } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`;
      } else if (diff < week) {
        return `${Math.floor(diff / day)}天前`;
      } else if (diff < month) {
        return `${Math.floor(diff / week)}周前`;
      } else {
        return formatDateTime(time, 'MM-DD');
      }
    },
    
    // 刷新历史记录
    refresh() {
      this.loadHistory(true);
    }
  }
};
</script>

<style lang="scss" scoped>
.photo-history {
  background-color: #f8f9fa;
  min-height: 100vh;
}

// 头部样式
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  // 样式已在 action-btn 中定义
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: none;
  border: 1px solid #f56c6c;
  border-radius: 16px;
  font-size: 12px;
  
  &:active {
    opacity: 0.7;
  }
}

.action-text {
  color: #f56c6c;
  font-size: 12px;
}

// 筛选器样式
.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 12px;
  border-radius: 16px;
  background-color: #f5f7fa;
  transition: all 0.3s;
  
  &--active {
    background-color: #007aff;
    
    .tab-text {
      color: #fff;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.tab-text {
  font-size: 12px;
  color: #606266;
  transition: color 0.3s;
}

.sort-section {
  // 样式已在 sort-btn 中定义
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  
  &:active {
    opacity: 0.7;
  }
}

.sort-text {
  font-size: 12px;
  color: #909399;
}

// 历史列表样式
.history-list {
  padding: 8px 16px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.item-image {
  position: relative;
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}

.status-badge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 10px;
  color: #fff;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.item-time {
  font-size: 12px;
  color: #909399;
}

.content-details {
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
  min-width: 32px;
}

.detail-value {
  font-size: 12px;
  color: #606266;
}

.background-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bg-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
}

.content-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-size,
.process-time {
  font-size: 11px;
  color: #c0c4cc;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.action-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f7fa;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.9);
  }
}

// 加载更多样式
.load-more {
  padding: 16px;
  text-align: center;
}

.load-more-btn {
  width: 100%;
  height: 44px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
  
  &:active {
    background-color: #ebeef5;
  }
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 32px;
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
  margin-bottom: 24px;
  line-height: 1.5;
}

.empty-btn {
  padding: 12px 24px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  
  &:active {
    opacity: 0.8;
  }
}

// 加载状态样式
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e1e6eb;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #909399;
}
</style>