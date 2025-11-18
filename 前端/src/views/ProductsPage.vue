<template>
  <div class="products-page">
    <div class="page-container">
      <el-card shadow="hover" class="main-card">
        <template #header>
          <div class="card-header">
            <span>商品列表</span>
          </div>
        </template>
        
        <div class="filter-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="8">
              <el-select v-model="filterCategory" placeholder="全部分类" @change="loadProducts" clearable>
                <el-option label="全部分类" value=""></el-option>
                <el-option 
                  v-for="category in categories" 
                  :key="category.category_id" 
                  :label="category.category_name" 
                  :value="category.category_id"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-select v-model="sortBy" placeholder="排序方式" @change="loadProducts" clearable>
                <el-option label="按时间排序" value="time"></el-option>
                <el-option label="价格从低到高" value="price_asc"></el-option>
                <el-option label="价格从高到低" value="price_desc"></el-option>
              </el-select>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索商品..."
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </el-col>
          </el-row>
        </div>

        <div class="product-list-container">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="6" animated />
          </div>

          <div v-else-if="products.length > 0" class="product-grid">
            <el-row :gutter="20">
              <el-col 
                v-for="product in products" 
                :key="product.product_id" 
                :xs="24" :sm="12" :md="8" :lg="6"
                class="product-col"
              >
                <el-card 
                  class="product-card" 
                  shadow="hover"
                  @click="showProductDetail(product.product_id)"
                >
                  <div class="product-image">
                    <el-image
                      v-if="product.image"
                      :src="product.image"
                      fit="cover"
                      class="product-img"
                      :preview-src-list="[product.image]"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                    <div v-else class="no-image">
                      <el-icon><Picture /></el-icon>
                      <span>暂无图片</span>
                    </div>
                    <div class="product-status">
                      <el-tag 
                        v-if="product.status === 'sold'" 
                        size="small" 
                        type="danger"
                      >
                        已售出
                      </el-tag>
                      <el-tag 
                        v-else 
                        size="small" 
                        type="success"
                      >
                        在售
                      </el-tag>
                    </div>
                  </div>
                  
                  <div class="product-content">
                    <h4 class="product-title" :title="product.title">{{ product.title }}</h4>
                    <p class="product-price">¥{{ product.price }}</p>
                    <p class="product-desc">{{ product.description || '暂无描述' }}</p>
                    
                    <div class="product-meta">
                      <span class="product-condition">
                        <el-icon><Star /></el-icon>
                        {{ product.condition }}
                      </span>
                      <span class="product-seller">
                        <el-icon><User /></el-icon>
                        {{ product.seller_name }}
                      </span>
                    </div>
                    
                    <div class="product-actions">
                      <el-button 
                        size="small" 
                        type="primary" 
                        @click.stop="showProductDetail(product.product_id)"
                      >
                        查看详情
                      </el-button>
                      <el-button 
                        v-if="userInfo" 
                        size="small" 
                        :type="product.is_favorited ? 'danger' : 'default'"
                        :icon="product.is_favorited ? StarFilled : Star"
                        @click.stop="toggleFavorite(product)"
                      >
                        {{ product.is_favorited ? '已收藏' : '收藏' }}
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 36, 48]"
                :small="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>

          <div v-else class="empty-state">
            <el-empty description="暂无商品" :image-size="200">
              <el-button type="primary" @click="$emit('show-page', 'publish')">
                发布商品
              </el-button>
            </el-empty>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Picture,
  Star,
  StarFilled,
  User
} from '@element-plus/icons-vue'

export default {
  name: 'ProductsPage',
  components: {
    Search,
    Picture,
    Star,
    StarFilled,
    User
  },
  props: {
    userInfo: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const router = useRouter()
    
    const products = ref([])
    const categories = ref([])
    const filterCategory = ref('')
    const sortBy = ref('time')
    const searchKeyword = ref('')
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)

    const loadProducts = async () => {
      try {
        loading.value = true
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟数据
        products.value = [
          {
            product_id: 1,
            title: '计算机教材数据结构与算法',
            price: 25,
            description: '计算机专业教材，九成新，无笔记',
            condition: '九成新',
            seller_name: '张同学',
            is_favorited: false,
            status: 'available',
            image: 'https://via.placeholder.com/300x200?text=Book'
          },
          {
            product_id: 2,
            title: '二手iPhone 12',
            price: 800,
            description: 'iPhone 12，功能完好，64GB',
            condition: '八成新',
            seller_name: '李同学',
            is_favorited: true,
            status: 'available',
            image: 'https://via.placeholder.com/300x200?text=Phone'
          },
          {
            product_id: 3,
            title: '机械键盘',
            price: 150,
            description: '青轴机械键盘，RGB背光',
            condition: '九五新',
            seller_name: '王同学',
            is_favorited: false,
            status: 'sold',
            image: 'https://via.placeholder.com/300x200?text=Keyboard'
          },
          {
            product_id: 4,
            title: '运动鞋',
            price: 120,
            description: '耐克运动鞋，42码',
            condition: '七成新',
            seller_name: '赵同学',
            is_favorited: false,
            status: 'available'
          },
          {
            product_id: 5,
            title: '笔记本电脑',
            price: 2500,
            description: '联想小新，i5处理器',
            condition: '九成新',
            seller_name: '陈同学',
            is_favorited: true,
            status: 'available',
            image: 'https://via.placeholder.com/300x200?text=Laptop'
          },
          {
            product_id: 6,
            title: '耳机',
            price: 80,
            description: '无线蓝牙耳机',
            condition: '八成新',
            seller_name: '刘同学',
            is_favorited: false,
            status: 'available',
            image: 'https://via.placeholder.com/300x200?text=Headphone'
          }
        ]
        total.value = 25 // 模拟总数据量
        loading.value = false
      } catch (error) {
        console.error('加载商品失败:', error)
        ElMessage.error('加载商品失败')
        loading.value = false
      }
    }

    const loadCategories = () => {
      // 模拟分类数据
      categories.value = [
        { category_id: 1, category_name: '图书教材' },
        { category_id: 2, category_name: '电子产品' },
        { category_id: 3, category_name: '生活用品' },
        { category_id: 4, category_name: '服饰鞋包' },
        { category_id: 5, category_name: '运动器材' }
      ]
    }

    const showProductDetail = (productId) => {
      router.push(`/product/${productId}`)
    }

    const toggleFavorite = (product) => {
      product.is_favorited = !product.is_favorited
      ElMessage.success(product.is_favorited ? '收藏成功' : '取消收藏')
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const handleSizeChange = (newSize) => {
      pageSize.value = newSize
      currentPage.value = 1
      loadProducts()
    }

    const handleCurrentChange = (newPage) => {
      currentPage.value = newPage
      loadProducts()
    }

    onMounted(() => {
      loadCategories()
      loadProducts()
    })

    return {
      products,
      categories,
      filterCategory,
      sortBy,
      searchKeyword,
      loading,
      currentPage,
      pageSize,
      total,
      loadProducts,
      showProductDetail,
      toggleFavorite,
      handleSearch,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
  overflow-y: auto;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section .el-row {
  margin-bottom: 10px;
}

.product-list-container {
  min-height: 400px;
}

.loading-container {
  padding: 40px 0;
}

.product-grid {
  margin-top: 20px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f8f9fa;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
}

.no-image, .image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  width: 100%;
  height: 100%;
}

.no-image .el-icon, .image-error .el-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.product-status {
  position: absolute;
  top: 8px;
  right: 8px;
}

.product-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff4757;
  margin-bottom: 8px;
}

.product-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.product-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.product-actions .el-button {
  flex: 1;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.empty-state {
  padding: 60px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .products-page {
    padding: 10px 0;
  }
  
  .page-container {
    padding: 0 12px;
  }
  
  .filter-section .el-col {
    margin-bottom: 12px;
  }
  
  .product-col {
    margin-bottom: 15px;
  }
  
  .product-image {
    height: 140px;
  }
  
  .product-content {
    padding: 12px;
  }
  
  .product-title {
    font-size: 15px;
  }
  
  .product-price {
    font-size: 18px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .product-grid .el-col {
    width: 100%;
  }
  
  .product-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>