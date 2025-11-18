<template>
  <div class="search-page">
    <!-- 搜索框 -->
    <el-card class="search-box" shadow="hover">
      <div class="search-input-group">
        <el-input
          v-model="searchParams.keyword"
          placeholder="输入商品名称、描述等关键词..."
          size="large"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select v-model="searchParams.category_id" placeholder="全部分类" clearable>
              <el-option label="全部分类" value=""></el-option>
              <el-option label="电子产品" value="1"></el-option>
              <el-option label="图书资料" value="2"></el-option>
              <el-option label="学习用品" value="3"></el-option>
              <el-option label="生活用品" value="4"></el-option>
              <el-option label="服装鞋帽" value="5"></el-option>
              <el-option label="运动器材" value="6"></el-option>
              <el-option label="其他" value="7"></el-option>
            </el-select>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 图片搜索 -->
      <div class="image-search-section">
        <el-upload
          class="image-upload"
          action="#"
          :show-file-list="false"
          :before-upload="beforeImageUpload"
          :http-request="handleImageSearch"
          accept="image/*"
        >
          <el-button type="success" :loading="imageSearchLoading">
            <el-icon><Picture /></el-icon>
            {{ imageSearchLoading ? '识别中...' : '图片搜索' }}
          </el-button>
        </el-upload>
        <span class="image-search-tip">上传商品图片，AI智能识别并搜索相似商品</span>
      </div>

      <!-- 热门搜索 -->
      <div v-if="hotKeywords.length > 0" class="hot-keywords">
        <span class="hot-title">热门搜索：</span>
        <el-tag
          v-for="keyword in hotKeywords"
          :key="keyword"
          class="keyword-tag"
          @click="searchParams.keyword = keyword; handleSearch()"
        >
          {{ keyword }}
        </el-tag>
      </div>
    </el-card>

    <!-- 搜索结果 -->
    <div class="search-results">
      <!-- 搜索结果头部 -->
      <div class="results-header">
        <div class="results-info">
          <span v-if="searchResults.length > 0" class="results-count">
            找到 {{ totalCount }} 个商品
            <span v-if="searchType === 'image'" class="search-type-tag">
              <el-icon><Picture /></el-icon>
              图片搜索：{{ searchKeyword }}
            </span>
          </span>
          <span v-else-if="hasSearched" class="no-results">
            没有找到相关商品
          </span>
          <span v-else class="default-tip">
            请输入关键词搜索商品
          </span>
        </div>
        <div class="sort-options">
          <el-select v-model="searchParams.sort_by" placeholder="排序方式" @change="handleSearch">
            <el-option label="默认排序" value="default"></el-option>
            <el-option label="价格从低到高" value="price_asc"></el-option>
            <el-option label="价格从高到低" value="price_desc"></el-option>
            <el-option label="最新发布" value="newest"></el-option>
            <el-option label="最热收藏" value="popular"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="searchResults.length > 0" class="products-grid">
        <el-card 
          v-for="product in searchResults" 
          :key="product.id"
          class="product-card"
          shadow="hover"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <div class="image-container">
              <el-icon v-if="!hasProductImage(product)" class="image-placeholder">
                <Picture />
              </el-icon>
              <el-image 
                v-else
                :src="getProductImage(product)"
                fit="cover"
                class="image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>图片加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ getShortDescription(product.description) }}</p>
            <div class="product-bottom">
              <span class="product-price">¥{{ product.price }}</span>
              <span class="product-condition">{{ getConditionText(product.condition) }}</span>
            </div>
            <div class="product-meta">
              <span class="product-category">{{ getCategoryName(product.category_id) }}</span>
              <span class="product-time">{{ formatTime(product.created_time) }}</span>
            </div>
            <div class="product-seller">
              <el-icon><User /></el-icon>
              {{ getSellerName(product) }}
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <div v-else-if="hasSearched" class="empty-state">
        <el-empty description="没有找到相关商品">
          <el-button type="primary" @click="resetSearch">重新搜索</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="searchResults.length > 0 && totalCount > searchParams.page_size" class="pagination-container">
        <el-pagination
          v-model:current-page="searchParams.page"
          :page-size="searchParams.page_size"
          :total="totalCount"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Search, Picture, User } from '@element-plus/icons-vue'
import mockDataService from '@/services/mockDataService'

export default {
  name: 'SearchPage',
  components: {
    Search,
    Picture,
    User
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        category_id: '',
        sort_by: 'default',
        page: 1,
        page_size: 12
      },
      searchResults: [],
      totalCount: 0,
      loading: false,
      hasSearched: false,
      hotKeywords: ['教材', '手机', '电脑', '自行车', '耳机', '课本', '运动鞋', 'Java编程'],
      imageSearchLoading: false,
      searchType: 'keyword', // 'keyword' 或 'image'
      searchKeyword: ''
    }
  },
  async mounted() {
    // 如果从首页搜索跳转过来，获取传递的关键词
    const query = this.$route.query
    if (query.keyword) {
      this.searchParams.keyword = query.keyword
      // 延迟执行搜索，确保组件完全加载
      setTimeout(() => {
        this.handleSearch()
      }, 100)
    }
  },
  methods: {
    // 执行搜索
    async handleSearch() {
      // 修复逻辑判断：当是关键词搜索且关键词为空时，显示警告
      if (this.searchType === 'keyword' && !this.searchParams.keyword.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }

      this.loading = true
      this.hasSearched = true
      
      try {
        console.log('🔍 开始搜索，参数:', this.searchParams)
        
        // 使用 mockDataService 进行搜索
        let results = []
        if (this.searchParams.keyword.trim()) {
          results = mockDataService.searchProducts(this.searchParams.keyword)
        } else if (this.searchParams.category_id) {
          results = mockDataService.getProductsByCategory(this.searchParams.category_id)
        } else {
          results = mockDataService.getAllProducts()
        }
        
        // 应用排序
        results = this.applySorting(results)
        
        // 应用分页
        const startIndex = (this.searchParams.page - 1) * this.searchParams.page_size
        const endIndex = startIndex + this.searchParams.page_size
        this.searchResults = results.slice(startIndex, endIndex)
        this.totalCount = results.length
        
        console.log('✅ 搜索结果:', {
          results: this.searchResults,
          total: this.totalCount
        })
        
        // 如果没有结果，显示提示
        if (this.searchResults.length === 0 && this.hasSearched) {
          this.$message.info('没有找到相关商品')
        }
        
      } catch (error) {
        console.error('❌ 搜索失败:', error)
        this.$message.error('搜索失败，请稍后重试')
        this.searchResults = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
    },

    // 应用排序
    applySorting(products) {
      const sorted = [...products]
      switch (this.searchParams.sort_by) {
        case 'price_asc':
          return sorted.sort((a, b) => a.price - b.price)
        case 'price_desc':
          return sorted.sort((a, b) => b.price - a.price)
        case 'newest':
          return sorted.sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
        case 'popular':
          return sorted.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
        default:
          return sorted
      }
    },

    // 图片上传前的验证
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    },

    // 处理图片搜索
    async handleImageSearch(options) {
      this.imageSearchLoading = true
      this.loading = true
      this.hasSearched = true
      this.searchType = 'image'

      try {
        const file = options.file
        // 模拟图片搜索 - 实际项目中这里应该调用AI识别API
        this.$message.info('图片搜索功能开发中，暂时使用关键词搜索')
        
        // 使用文件名作为搜索关键词
        const fileName = file.name.replace(/\.[^/.]+$/, "") // 移除扩展名
        this.searchParams.keyword = fileName
        this.searchKeyword = `图片: ${fileName}`
        
        // 执行搜索
        await this.handleSearch()
        
      } catch (error) {
        console.error('图片搜索失败:', error)
        this.$message.error('图片搜索失败，请稍后重试')
        this.searchResults = []
        this.totalCount = 0
      } finally {
        this.imageSearchLoading = false
        this.loading = false
      }
    },

    // 检查商品是否有图片
    hasProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images && images.length > 0 && images[0]
    },

    // 获取商品图片
    getProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images[0]
    },

    // 获取简短描述
    getShortDescription(description) {
      if (!description) return '暂无描述'
      return description.length > 50 ? description.substring(0, 50) + '...' : description
    },

    // 获取卖家名称
    getSellerName(product) {
      return product.seller_info?.username || '匿名用户'
    },

    // 获取成色文本
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

    // 获取分类名称
    getCategoryName(categoryId) {
      return mockDataService.getCategoryName(categoryId)
    },

    // 跳转到商品详情
    goToProductDetail(productId) {
      console.log('跳转到商品详情，ID:', productId)
      if (productId) {
        this.$router.push(`/product/${productId}`)
      } else {
        console.error('商品ID无效:', productId)
        this.$message.warning('商品ID无效')
      }
    },

    // 分页处理
    handlePageChange(page) {
      this.searchParams.page = page
      this.handleSearch()
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    // 重置搜索
    resetSearch() {
      this.searchParams.keyword = ''
      this.searchParams.page = 1
      this.searchParams.category_id = ''
      this.searchParams.sort_by = 'default'
      this.searchResults = []
      this.totalCount = 0
      this.hasSearched = false
      this.searchType = 'keyword'
      this.searchKeyword = ''
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
  }
}
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  margin-bottom: 30px;
  border: none;
}

.search-input-group {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
}

.image-search-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.image-search-tip {
  font-size: 14px;
  color: #666;
}

.hot-keywords {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-title {
  color: #606266;
  font-size: 14px;
}

.keyword-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.keyword-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.search-results {
  min-height: 400px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.results-count {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.search-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.no-results, .default-tip {
  font-size: 16px;
  color: #909399;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.image-placeholder {
  font-size: 48px;
  color: #909399;
}

.product-image .image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
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

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.product-condition {
  padding: 2px 8px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 3px;
  font-size: 12px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.product-category {
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 3px;
}

.product-seller {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .search-page {
    padding: 10px;
  }
  
  .results-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .image-search-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .product-image {
    height: 120px;
  }
  
  .hot-keywords {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-title {
    font-size: 14px;
  }
  
  .product-description {
    font-size: 12px;
  }
}
</style>