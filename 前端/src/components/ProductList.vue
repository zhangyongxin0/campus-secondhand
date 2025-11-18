<template>
  <div class="product-list">
    <div v-if="products.length === 0" class="empty-state">
      <el-empty description="暂无商品数据">
        <el-button type="primary" @click="$emit('refresh')">刷新页面</el-button>
      </el-empty>
    </div>
    
    <el-row v-else :gutter="20">
      <el-col 
        v-for="product in products" 
        :key="product.product_id || product.id" 
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
      >
        <el-card 
          class="product-card" 
          shadow="hover"
          :body-style="{ padding: '0' }"
        >
          <!-- 商品图片 -->
          <div class="product-image" @click="$emit('view-detail', product)">
            <el-image 
              :src="getProductImage(product)" 
              fit="cover" 
              class="image"
              :preview-src-list="getPreviewImages(product)"
              :hide-on-click-modal="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
            </el-image>
            
            <!-- 商品状态标签 -->
            <div class="product-badges">
              <el-tag 
                v-if="product.condition" 
                size="small" 
                :type="getConditionType(product.condition)"
                class="condition-tag"
              >
                {{ getConditionText(product.condition) }}
              </el-tag>
            </div>
          </div>
          
          <!-- 商品信息 -->
          <div class="product-info">
            <h4 class="product-title" :title="product.title" @click="$emit('view-detail', product)">
              {{ product.title }}
            </h4>
            
            <p class="product-description" :title="product.description">
              {{ truncateDescription(product.description) }}
            </p>
            
            <div class="product-meta">
              <span class="product-price">¥{{ formatPrice(product.price) }}</span>
              
              <div class="product-stats">
                <span class="view-count" v-if="product.view_count">
                  <el-icon><View /></el-icon>
                  {{ product.view_count }}
                </span>
                <span class="favorite-count" v-if="product.favorite_count">
                  <el-icon><Star /></el-icon>
                  {{ product.favorite_count }}
                </span>
              </div>
            </div>
            
            <!-- 卖家信息 -->
            <div v-if="product.seller_info" class="seller-info">
              <el-avatar 
                :size="24" 
                :src="product.seller_info.avatar" 
                class="seller-avatar"
              >
                {{ getAvatarText(product.seller_info.username) }}
              </el-avatar>
              <span class="seller-name">{{ product.seller_info.username }}</span>
            </div>
            
            <!-- 发布时间 -->
            <div class="product-time">
              <el-icon><Clock /></el-icon>
              {{ formatTime(product.created_at || product.created_time) }}
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="product-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="$emit('view-detail', product)"
              class="view-detail-btn"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            
            <el-button 
              v-if="showFavorite"
              size="small" 
              :type="product.is_favorited ? 'warning' : 'default'"
              @click="$emit('toggle-favorite', product)"
              class="favorite-btn"
            >
              <el-icon><Star /></el-icon>
              {{ product.is_favorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 加载更多 -->
    <div v-if="showLoadMore && products.length > 0" class="load-more">
      <el-button 
        :loading="loading" 
        @click="$emit('load-more')"
        type="primary"
        text
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { 
  Picture, 
  Loading, 
  View, 
  Star, 
  Clock 
} from '@element-plus/icons-vue'

export default {
  name: 'ProductList',
  components: {
    Picture,
    Loading,
    View,
    Star,
    Clock
  },
  props: {
    products: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showLoadMore: {
      type: Boolean,
      default: false
    },
    showFavorite: {
      type: Boolean,
      default: true
    }
  },
  emits: ['view-detail', 'toggle-favorite', 'load-more', 'refresh'],
  methods: {
    // 获取商品图片 - 修复404问题
    getProductImage(product) {
      // 优先使用商品图片
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0]
        // 确保图片URL是有效的
        if (firstImage && (firstImage.startsWith('http') || firstImage.startsWith('/') || firstImage.startsWith('data:'))) {
          return firstImage
        }
      }
      
      // 使用在线占位图片，基于商品标题生成
      const text = product.title ? encodeURIComponent(product.title.substring(0, 6)) : '商品图片'
      const color = this.getProductColor(product)
      return `https://via.placeholder.com/300x200/${color.background}/${color.text}?text=${text}`
    },
    
    // 获取预览图片列表
    getPreviewImages(product) {
      if (product.images && product.images.length > 0) {
        return product.images.filter(img => img && (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')))
      }
      return [this.getProductImage(product)]
    },
    
    // 根据商品信息生成颜色
    getProductColor(product) {
      const colors = [
        { background: 'f0f9ff', text: '0288d1' }, // 蓝色
        { background: 'f0fff0', text: '388e3c' }, // 绿色
        { background: 'fff0f5', text: 'c2185b' }, // 粉色
        { background: 'fff8e1', text: 'ff8f00' }, // 橙色
        { background: 'f3e5f5', text: '7b1fa2' }, // 紫色
      ]
      const index = (product.product_id || product.id || 0) % colors.length
      return colors[index]
    },
    
    // 获取商品状态类型
    getConditionType(condition) {
      const typeMap = {
        'new': 'success',
        'like_new': 'primary',
        'good': 'warning',
        'fair': 'info',
        'poor': 'danger',
        '全新': 'success',
        '九成新': 'primary',
        '八成新': 'warning',
        '七成新': 'info',
        '六成新': 'danger'
      }
      return typeMap[condition] || 'info'
    },
    
    // 获取商品状态文本
    getConditionText(condition) {
      const textMap = {
        'new': '全新',
        'like_new': '九成新',
        'good': '八成新',
        'fair': '七成新',
        'poor': '六成新'
      }
      return textMap[condition] || condition
    },
    
    // 截断描述文本
    truncateDescription(description) {
      if (!description) return '暂无描述'
      if (description.length > 50) {
        return description.substring(0, 50) + '...'
      }
      return description
    },
    
    // 格式化价格
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    
    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '未知时间'
      try {
        const date = new Date(timeString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        
        if (days === 0) {
          return '今天'
        } else if (days === 1) {
          return '昨天'
        } else if (days < 7) {
          return `${days}天前`
        } else {
          return date.toLocaleDateString('zh-CN')
        }
      } catch (error) {
        return '未知时间'
      }
    },
    
    // 获取头像文本
    getAvatarText(username) {
      if (!username) return '用'
      if (username.length >= 2) {
        return username.substring(0, 2)
      }
      return username
    }
  }
}
</script>

<style scoped>
.product-list {
  padding: 20px 0;
}

.empty-state {
  padding: 60px 0;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover .image {
  transform: scale(1.05);
}

.image-error,
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 14px;
}

.image-error .el-icon,
.image-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: #c0c4cc;
}

.product-badges {
  position: absolute;
  top: 8px;
  left: 8px;
}

.condition-tag {
  font-size: 12px;
  border: none;
}

.product-info {
  padding: 16px;
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
  line-height: 1.4;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.product-title:hover {
  color: #409eff;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.product-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.view-count,
.favorite-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

.seller-avatar {
  background: #409eff;
}

.seller-name {
  font-size: 12px;
  color: #606266;
}

.product-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.product-actions {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}

.view-detail-btn {
  flex: 1;
}

.favorite-btn {
  min-width: 60px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-list {
    padding: 10px 0;
  }
  
  .product-image {
    height: 160px;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-title {
    font-size: 14px;
  }
  
  .product-description {
    font-size: 12px;
  }
  
  .product-price {
    font-size: 18px;
  }
  
  .product-actions {
    padding: 8px 12px;
    flex-direction: column;
  }
  
  .view-detail-btn,
  .favorite-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .product-image {
    height: 140px;
  }
  
  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .product-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>