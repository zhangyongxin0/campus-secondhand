<template>
  <div class="user-profile">
    <el-tabs v-model="activeTab" type="card">
      <!-- 个人信息标签页 -->
      <el-tab-pane label="个人信息" name="profile">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="editMode = true" v-if="!editMode">编辑信息</el-button>
            </div>
          </template>
          
          <el-form :model="userInfo" label-width="100px" ref="profileForm">
            <el-form-item label="学号">
              <el-input v-model="userInfo.student_id" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="name" 
              :rules="[{ required: true, message: '姓名不能为空' }]">
              <el-input v-model="userInfo.name" :disabled="!editMode" />
            </el-form-item>
            <el-form-item label="学院">
              <el-input v-model="userInfo.college" :disabled="!editMode" />
            </el-form-item>
            <el-form-item label="专业">
              <el-input v-model="userInfo.major" :disabled="!editMode" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email"
              :rules="[
                { required: true, message: '邮箱不能为空' },
                { type: 'email', message: '请输入正确的邮箱格式' }
              ]">
              <el-input v-model="userInfo.email" :disabled="!editMode" />
            </el-form-item>
            <el-form-item label="手机" prop="phone"
              :rules="[
                { required: true, message: '手机号不能为空' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
              ]">
              <el-input v-model="userInfo.phone" :disabled="!editMode" />
            </el-form-item>
            
            <el-form-item v-if="editMode">
              <el-button type="primary" @click="saveProfile">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 我的收藏标签页 -->
      <el-tab-pane label="我的收藏" name="favorites">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>我的收藏</span>
              <span class="favorite-count">共 {{ favoriteCount }} 个收藏</span>
            </div>
          </template>

          <div v-if="favoritesLoading" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>

          <div v-else-if="favorites.length > 0" class="favorites-grid">
            <el-card 
              v-for="item in favorites" 
              :key="item.favorite_id || item.id"
              class="favorite-card"
              shadow="hover"
            >
              <div class="favorite-content">
                <div class="product-image" @click="goToProductDetail(item.product_id)">
                  <el-icon v-if="!hasProductImage(item)" class="image-placeholder">
                    <Picture />
                  </el-icon>
                  <el-image 
                    v-else
                    :src="getProductImage(item)"
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
                
                <div class="product-info">
                  <h4 class="product-title" @click="goToProductDetail(item.product_id)">
                    {{ item.title }}
                  </h4>
                  <p class="product-price">¥{{ item.price }}</p>
                  <p class="product-condition">{{ getConditionText(item.condition) }}</p>
                  <p class="favorite-time">收藏于 {{ formatTime(item.created_time || item.created_at) }}</p>
                </div>
                
                <div class="favorite-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="goToProductDetail(item.product_id)"
                  >
                    查看详情
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeFavorite(item.product_id)"
                    :loading="removeLoading[item.product_id]"
                  >
                    取消收藏
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <div v-else class="empty-favorites">
            <el-empty description="暂无收藏商品">
              <el-button type="primary" @click="$router.push('/search')">去逛逛</el-button>
            </el-empty>
          </div>

          <!-- 分页 -->
          <div v-if="favorites.length > 0 && favoriteCount > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="favoriteCount"
              layout="total, prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Picture } from '@element-plus/icons-vue'
import mockDataService from '@/services/mockDataService'

export default {
  name: 'UserProfile',
  components: {
    Picture
  },
  data() {
    return {
      activeTab: 'profile',
      editMode: false,
      originalUserInfo: {},
      
      // 收藏相关数据
      favorites: [],
      favoritesLoading: false,
      favoriteCount: 0,
      currentPage: 1,
      pageSize: 12,
      removeLoading: {}
    }
  },
  computed: {
    userInfo() {
      // 从 localStorage 获取用户信息
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          return JSON.parse(userInfoStr)
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      return {
        student_id: '',
        name: '',
        college: '',
        major: '',
        email: '',
        phone: ''
      }
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'favorites') {
        this.loadFavorites()
      }
    }
  },
  methods: {
    // 个人信息相关方法
    saveProfile() {
      this.$refs.profileForm.validate((valid) => {
        if (valid) {
          // 保存到 localStorage
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          this.editMode = false
          this.$message.success('个人信息更新成功')
        }
      })
    },

    cancelEdit() {
      this.editMode = false
      // 恢复原始数据
      Object.assign(this.userInfo, this.originalUserInfo)
    },

    // 收藏相关方法
    async loadFavorites() {
      this.favoritesLoading = true
      const userId = this.getCurrentUserId()
      
      try {
        // 使用 mockDataService 获取收藏列表
        const favorites = mockDataService.getUserFavorites(userId)
        this.favorites = favorites
        this.favoriteCount = favorites.length
        
        console.log('✅ 加载收藏列表成功:', this.favorites)
      } catch (error) {
        console.error('❌ 加载收藏列表失败:', error)
        this.$message.error('加载收藏列表失败')
        this.favorites = []
        this.favoriteCount = 0
      } finally {
        this.favoritesLoading = false
      }
    },

    async removeFavorite(productId) {
      const userId = this.getCurrentUserId()
      
      this.$set(this.removeLoading, productId, true)
      
      try {
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
      } finally {
        this.$set(this.removeLoading, productId, false)
      }
    },

    goToProductDetail(productId) {
      this.$router.push(`/product/${productId}`)
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadFavorites()
    },

    // 工具方法
    hasProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images && images.length > 0 && images[0]
    },

    getProductImage(product) {
      const images = mockDataService.processProductImages(product)
      return images[0] || ''
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
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } catch (error) {
        return ''
      }
    },

    getCurrentUserId() {
      // 从 localStorage 获取用户ID
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          return userInfo.student_id || userInfo.id || 'mock-user-1'
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      return localStorage.getItem('userId') || 'mock-user-1'
    }
  },
  mounted() {
    console.log('✅ 个人中心页面加载，用户信息:', this.userInfo)
    
    // 保存原始用户信息用于取消编辑时恢复
    this.originalUserInfo = { ...this.userInfo }
    
    // 如果直接访问收藏标签页，加载收藏列表
    if (this.activeTab === 'favorites') {
      this.loadFavorites()
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-count {
  color: #606266;
  font-size: 14px;
}

.loading-state {
  padding: 40px 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.favorite-card {
  transition: all 0.3s;
  border: none;
}

.favorite-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.favorite-content {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-placeholder {
  font-size: 24px;
  color: #909399;
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
  color: #909399;
  background: #f5f7fa;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  font-size: 16px;
  color: #303133;
  margin: 0 0 8px;
  cursor: pointer;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-title:hover {
  color: #409eff;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 0 4px;
}

.product-condition {
  font-size: 12px;
  color: #409eff;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 4px;
}

.favorite-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.favorite-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.empty-favorites {
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .user-profile {
    padding: 10px;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .favorite-content {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 120px;
  }
  
  .favorite-actions {
    flex-direction: row;
    width: 100%;
  }
  
  .favorite-actions .el-button {
    flex: 1;
  }
}
</style>