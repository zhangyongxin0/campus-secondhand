<template>
  <div class="home-page-wrapper">
    <div class="home-container">
      <el-card class="welcome-card" shadow="hover">
        <div class="welcome-content">
          <h2>欢迎使用校园二手交易平台</h2>
          <p class="welcome-desc">让闲置物品找到新主人，让校园生活更环保更经济</p>
          
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="goToProducts">
              <el-icon><Search /></el-icon>浏览商品
            </el-button>
            <el-button 
              v-if="userInfo" 
              type="success" 
              size="large" 
              @click="goToPublish"
            >
              <el-icon><Plus /></el-icon>发布商品
            </el-button>
            <el-button 
              v-if="!userInfo" 
              type="success" 
              size="large" 
              @click="goToLogin"
            >
              <el-icon><User /></el-icon>登录后发布商品
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 搜索区域 -->
      <el-card class="search-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>搜索商品</span>
          </div>
        </template>
        <div class="search-content">
          <el-input
            v-model="searchKeyword"
            placeholder="输入关键词搜索商品..."
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>搜索
              </el-button>
            </template>
          </el-input>
          
          <!-- 热门搜索关键词 -->
          <div v-if="hotKeywords.length > 0" class="hot-search">
            <span class="hot-title">热门搜索：</span>
            <el-tag
              v-for="keyword in hotKeywords"
              :key="keyword"
              class="keyword-tag"
              @click="searchKeyword = keyword; handleSearch()"
            >
              {{ keyword }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 商品展示区域 -->
      <el-card class="products-section" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>热门商品</span>
            <div class="header-actions">
              <el-button 
                type="primary" 
                text 
                @click="goToProducts"
                class="view-all-btn"
              >
                查看全部
              </el-button>
              <el-tooltip content="刷新商品列表">
                <el-button 
                  type="info" 
                  text 
                  :loading="loading"
                  @click="loadProducts"
                  class="refresh-btn"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </template>
        <div class="products-content">
          <!-- 商品加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>
          
          <!-- 商品列表 -->
          <div v-else-if="products.length > 0" class="products-grid">
            <el-card 
              v-for="product in products" 
              :key="product.id"
              class="product-card"
              shadow="hover"
              @click="goToProductDetail(product.id)"
            >
              <div class="product-image">
                <el-image 
                  :src="getProductImage(product)"
                  fit="cover"
                  class="image"
                  :preview-src-list="[getProductImage(product)]"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>暂无图片</span>
                    </div>
                  </template>
                  <template #placeholder>
                    <div class="image-loading">
                      <el-icon><Loading /></el-icon>
                      <span>加载中...</span>
                    </div>
                  </template>
                </el-image>
                <div class="product-badges">
                  <span class="view-count">
                    <el-icon><View /></el-icon>
                    {{ product.view_count || 0 }}
                  </span>
                  <span class="favorite-count">
                    <el-icon><Star /></el-icon>
                    {{ product.favorite_count || 0 }}
                  </span>
                </div>
              </div>
              <div class="product-info">
                <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
                <p class="product-description">{{ getShortDescription(product.description) }}</p>
                <div class="product-price-section">
                  <span class="product-price">¥{{ product.price }}</span>
                  <span v-if="product.original_price" class="original-price">
                    ¥{{ product.original_price }}
                  </span>
                </div>
                <div class="product-meta">
                  <el-tag 
                    :type="getConditionType(product.condition)" 
                    size="small"
                    class="condition-tag"
                  >
                    {{ product.condition }}
                  </el-tag>
                  <span class="product-category">{{ getCategoryName(product.category_id) }}</span>
                </div>
                <div class="product-seller">
                  <el-icon><User /></el-icon>
                  <span class="seller-name">{{ getSellerName(product) }}</span>
                  <el-rate
                    :model-value="getSellerRating(product)"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                    size="small"
                  />
                </div>
                <div class="product-time">
                  {{ formatTime(product.created_time) }}
                </div>
              </div>
            </el-card>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="暂无商品，快去发布第一个商品吧！">
              <el-button type="primary" @click="goToPublish">发布商品</el-button>
            </el-empty>
          </div>
        </div>
      </el-card>

      <!-- 平台特色 -->
      <div class="features-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" class="feature-item">
            <el-card shadow="hover" class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><Trophy /></el-icon>
              </div>
              <h3>安全可靠</h3>
              <p>实名认证，学号验证，交易更安心</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" class="feature-item">
            <el-card shadow="hover" class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><Coin /></el-icon>
              </div>
              <h3>经济实惠</h3>
              <p>闲置物品再利用，省钱又环保</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" class="feature-item">
            <el-card shadow="hover" class="feature-card">
              <div class="feature-icon">
                <el-icon size="48"><ChatDotRound /></el-icon>
              </div>
              <h3>便捷沟通</h3>
              <p>在线留言，快速联系卖家</p>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 平台统计 -->
      <el-card class="stats-card" shadow="hover" v-if="stats">
        <template #header>
          <div class="card-header">
            <span>平台统计</span>
          </div>
        </template>
        <div class="stats-content">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6" class="stat-item">
              <div class="stat-value">{{ stats.total_products }}</div>
              <div class="stat-label">商品数量</div>
            </el-col>
            <el-col :xs="12" :sm="6" class="stat-item">
              <div class="stat-value">{{ stats.total_views }}</div>
              <div class="stat-label">总浏览量</div>
            </el-col>
            <el-col :xs="12" :sm="6" class="stat-item">
              <div class="stat-value">{{ stats.total_favorites }}</div>
              <div class="stat-label">总收藏数</div>
            </el-col>
            <el-col :xs="12" :sm="6" class="stat-item">
              <div class="stat-value">{{ Object.keys(stats.categories).length }}</div>
              <div class="stat-label">商品分类</div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { 
  Search, Plus, User, Trophy, Coin, ChatDotRound, 
  Picture, Refresh, View, Star, Loading 
} from '@element-plus/icons-vue'
import mockDataService from '@/services/mockDataService'

export default {
  name: 'HomePage',
  components: {
    Search, Plus, User, Trophy, Coin, ChatDotRound, 
    Picture, Refresh, View, Star, Loading
  },
  props: {
    userInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      searchKeyword: '',
      loading: false,
      products: [],
      stats: null,
      hotKeywords: ['教材', '手机', '电脑', '自行车', '耳机', '课本', '运动鞋', 'Java编程']
    }
  },
  methods: {
    goToProducts() {
      this.$router.push('/products')
    },
    goToPublish() {
      this.$router.push('/publish')
    },
    goToLogin() {
      this.$router.push('/login')
    },
    goToProductDetail(productId) {
      if (productId) {
        this.$router.push(`/product/${productId}`)
      } else {
        this.$message.warning('商品ID无效')
      }
    },
    
    // 搜索方法
    handleSearch() {
      if (this.searchKeyword.trim()) {
        // 跳转到搜索页面并传递关键词
        this.$router.push({
          path: '/search',
          query: {
            keyword: this.searchKeyword.trim()
          }
        })
      } else {
        this.$message.warning('请输入搜索关键词')
      }
    },
    
    // 加载商品数据
    async loadProducts() {
      this.loading = true
      try {
        // 使用 MockDataService 获取热门商品
        this.products = mockDataService.getHotProducts(8)
        
        // 获取平台统计信息
        this.stats = mockDataService.getProductStats()
        
        console.log('加载商品成功:', this.products.length, '个商品')
      } catch (error) {
        console.error('加载商品失败:', error)
        this.$message.error('加载商品失败')
        this.products = []
      } finally {
        this.loading = false
      }
    },

    // 获取商品图片
    getProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images[0]
    },

    // 获取分类名称
    getCategoryName(categoryId) {
      return mockDataService.getCategoryName(categoryId)
    },

    // 获取卖家名称
    getSellerName(product) {
      return product.seller_info?.username || '匿名用户'
    },

    // 获取卖家评分
    getSellerRating(product) {
      return product.seller_info?.rating || 0
    },

    // 获取简短描述
    getShortDescription(description) {
      if (!description) return '暂无描述'
      return description.length > 50 ? description.substring(0, 50) + '...' : description
    },

    // 获取成色标签类型
    getConditionType(condition) {
      const typeMap = {
        '全新': 'success',
        '九成新': 'primary',
        '八成新': '',
        '七成新': 'warning',
        '六成新及以下': 'danger'
      }
      return typeMap[condition] || 'info'
    },
    
    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return ''
      try {
        const date = new Date(timeString)
        const now = new Date()
        const diff = now - date
        
        // 如果是今天内，显示时间
        if (diff < 24 * 60 * 60 * 1000) {
          return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }
        
        // 如果是今年内，显示月日
        if (date.getFullYear() === now.getFullYear()) {
          return date.toLocaleDateString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit' 
          })
        }
        
        // 其他情况显示完整日期
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return ''
      }
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.home-page-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
}

.welcome-card {
  margin-bottom: 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
  color: white;
}

.welcome-content h2 {
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: 600;
}

.welcome-desc {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.search-card {
  margin-bottom: 30px;
  border: none;
}

.search-content {
  padding: 10px 0;
}

.search-input {
  margin-bottom: 15px;
}

/* 热门搜索样式 */
.hot-search {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.hot-title {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}

.keyword-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.keyword-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 商品展示区域样式 */
.products-section {
  margin-bottom: 30px;
  border: none;
}

.products-section .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.product-image .image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
}

.product-card:hover .product-image .image {
  transform: scale(1.05);
}

.image-error, .image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
}

.image-error .el-icon, .image-loading .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.product-badges {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.view-count, .favorite-count {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-info {
  padding: 15px;
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
  font-weight: 600;
}

.product-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.condition-tag {
  font-size: 12px;
}

.product-category {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.product-seller {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.seller-name {
  flex: 1;
}

.product-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 40px 0;
}

/* 平台特色样式 */
.features-section {
  margin: 40px 0;
}

.feature-card {
  text-align: center;
  border: none;
  transition: transform 0.3s;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: 15px;
  color: #409eff;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 18px;
}

.feature-card p {
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

/* 统计卡片样式 */
.stats-card {
  border: none;
  margin-top: 30px;
}

.stats-content {
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .home-page-wrapper {
    padding: 0;
  }
  
  .home-container {
    padding: 10px;
    min-height: calc(100vh - 120px);
  }
  
  .welcome-content h2 {
    font-size: 24px;
  }
  
  .welcome-desc {
    font-size: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 200px;
  }
  
  .search-content {
    padding: 5px 0;
  }
  
  .hot-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .product-image {
    height: 140px;
  }
  
  .product-title {
    font-size: 14px;
  }
  
  .product-price {
    font-size: 18px;
  }
  
  .product-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}
</style>