<template>
  <div class="favorites-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的收藏</span>
          <div class="header-actions">
            <el-button 
              type="danger" 
              text 
              @click="clearAllFavorites"
              :disabled="favorites.length === 0"
            >
              清空收藏
            </el-button>
          </div>
        </div>
      </template>

      <div class="favorites-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 收藏列表 -->
        <div v-else-if="favorites.length > 0" class="favorites-list">
          <el-card 
            v-for="favorite in favorites" 
            :key="favorite.id"
            class="favorite-item"
            shadow="hover"
          >
            <div class="item-content">
              <div class="product-image" @click="goToProductDetail(favorite.product_id)">
                <el-image 
                  :src="getProductImage(favorite.product_info)"
                  fit="cover"
                  class="image"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              
              <div class="product-info" @click="goToProductDetail(favorite.product_id)">
                <h3 class="product-title">{{ favorite.product_info.title }}</h3>
                <p class="product-description">{{ getShortDescription(favorite.product_info.description) }}</p>
                <div class="product-price">¥{{ favorite.product_info.price }}</div>
                <div class="product-meta">
                  <el-tag size="small">{{ getConditionText(favorite.product_info.condition) }}</el-tag>
                  <span class="category">{{ getCategoryName(favorite.product_info.category_id) }}</span>
                </div>
                <div class="product-stats">
                  <span class="stat">
                    <el-icon><View /></el-icon>
                    {{ favorite.product_info.view_count || 0 }}
                  </span>
                  <span class="stat">
                    <el-icon><Star /></el-icon>
                    {{ favorite.product_info.favorite_count || 0 }}
                  </span>
                </div>
                <div class="favorite-time">
                  收藏于: {{ formatTime(favorite.created_time) }}
                </div>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  @click="goToProductDetail(favorite.product_id)"
                >
                  查看详情
                </el-button>
                <el-button 
                  type="danger" 
                  @click="removeFavorite(favorite.id, favorite.product_id)"
                >
                  取消收藏
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="您还没有收藏任何商品">
            <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
          </el-empty>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Picture, View, Star } from '@element-plus/icons-vue'
import mockDataService from '@/services/mockDataService'

export default {
  name: 'FavoritesPage',
  components: {
    Picture,
    View,
    Star
  },
  data() {
    return {
      favorites: [],
      loading: false
    }
  },
  computed: {
    getCategoryName() {
      return (categoryId) => mockDataService.getCategoryName(categoryId)
    }
  },
  methods: {
    async loadFavorites() {
      this.loading = true
      try {
        const userId = this.getCurrentUserId()
        console.log('🔍 加载收藏列表，用户ID:', userId)
        
        if (!userId) {
          this.$message.warning('请先登录')
          this.$router.push('/login?returnUrl=/favorites')
          return
        }

        this.favorites = mockDataService.getUserFavorites(userId)
        console.log('✅ 加载收藏列表成功:', this.favorites)
      } catch (error) {
        console.error('❌ 加载收藏列表失败:', error)
        this.$message.error('加载收藏列表失败')
      } finally {
        this.loading = false
      }
    },

    async removeFavorite(favoriteId, productId) {
      try {
        const userId = this.getCurrentUserId()
        console.log('🗑️ 取消收藏，用户ID:', userId, '商品ID:', productId)
        
        const success = mockDataService.removeFavorite(userId, productId)
        
        if (success) {
          this.$message.success('取消收藏成功')
          // 重新加载收藏列表
          await this.loadFavorites()
        } else {
          this.$message.error('取消收藏失败')
        }
      } catch (error) {
        console.error('取消收藏失败:', error)
        this.$message.error('取消收藏失败')
      }
    },

    async clearAllFavorites() {
      try {
        await this.$confirm('确定要清空所有收藏吗？', '提示', {
          type: 'warning'
        })
        
        const userId = this.getCurrentUserId()
        const userFavorites = mockDataService.getUserFavorites(userId)
        
        console.log('🗑️ 清空所有收藏，用户ID:', userId, '收藏数量:', userFavorites.length)
        
        // 移除所有收藏
        userFavorites.forEach(favorite => {
          mockDataService.removeFavorite(userId, favorite.product_id)
        })
        
        this.$message.success('已清空所有收藏')
        await this.loadFavorites()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清空收藏失败:', error)
          this.$message.error('清空收藏失败')
        }
      }
    },

    goToProductDetail(productId) {
      if (productId) {
        console.log('🔗 跳转到商品详情:', productId)
        this.$router.push(`/product/${productId}`)
      }
    },

    getProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images[0]
    },

    getShortDescription(description) {
      if (!description) return '暂无描述'
      return description.length > 100 ? description.substring(0, 100) + '...' : description
    },

    getConditionText(condition) {
      const conditionMap = {
        'new': '全新',
        'like_new': '九成新',
        'good': '八成新',
        'fair': '七成新',
        'poor': '六成新及以下',
        '全新': '全新',
        '九成新': '九成新',
        '七成新': '七成新',
        '五成新': '五成新'
      }
      return conditionMap[condition] || condition || '未知'
    },

    formatTime(timeString) {
      if (!timeString) return ''
      try {
        const date = new Date(timeString)
        return date.toLocaleString('zh-CN')
      } catch (error) {
        return ''
      }
    },

    getCurrentUserId() {
      const userInfoStr = localStorage.getItem('userInfo')
      console.log('👤 获取用户信息:', userInfoStr)
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          // 关键修改：优先使用 student_id，因为这是你的登录系统使用的标识
          const userId = userInfo.student_id || userInfo.id || userInfo.userId
          console.log('✅ 解析出的用户ID:', userId)
          return userId
        } catch (e) {
          console.error('❌ 解析用户信息失败:', e)
        }
      }
      
      // 如果都没有，尝试从 localStorage 直接获取
      const userId = localStorage.getItem('userId')
      console.log('📝 从localStorage获取的用户ID:', userId)
      
      return userId || 'mock-user-1'
    }
  },
  async mounted() {
    console.log('🚀 收藏页面加载')
    await this.loadFavorites()
  }
}
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-item {
  transition: all 0.3s;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.product-image .image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.product-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.product-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.category {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.product-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.favorite-time {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 10px;
  }
  
  .item-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
  }
  
  .action-buttons {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .action-buttons .el-button {
    flex: 1;
  }
}
</style>