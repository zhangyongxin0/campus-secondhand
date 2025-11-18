<template>
  <div class="product-detail-wrapper">
    <div class="product-detail-container">
      <div class="product-detail">
        <el-card v-loading="loading" class="detail-card">
          <el-row :gutter="20">
            <!-- 商品图片区域 -->
            <el-col :xs="24" :md="12">
              <div class="product-image-gallery">
                <el-image 
                  :src="mainImage" 
                  fit="cover" 
                  class="main-image"
                  :preview-src-list="productImages"
                />
                <div v-if="productImages.length > 1" class="image-thumbnails">
                  <el-image 
                    v-for="(img, index) in productImages" 
                    :key="index"
                    :src="img" 
                    fit="cover" 
                    class="thumbnail"
                    :class="{ active: mainImage === img }"
                    @click="mainImage = img"
                  />
                </div>
              </div>
            </el-col>
            
            <!-- 商品信息区域 -->
            <el-col :xs="24" :md="12">
              <div class="product-info">
                <h1 class="product-title">{{ productInfo.title }}</h1>
                <div class="price-section">
                  <span class="product-price">¥{{ productInfo.price }}</span>
                  <span v-if="productInfo.original_price" class="original-price">
                    原价: ¥{{ productInfo.original_price }}
                  </span>
                </div>
                
                <div class="product-meta">
                  <el-tag :type="getConditionType(productInfo.condition)" class="condition-tag">
                    {{ productInfo.condition }}
                  </el-tag>
                  <el-tag type="info" class="category-tag">
                    {{ getCategoryName(productInfo.category_id) }}
                  </el-tag>
                </div>

                <div class="product-stats">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    浏览: {{ productInfo.view_count || 0 }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Star /></el-icon>
                    收藏: {{ productInfo.favorite_count || 0 }}
                  </span>
                  <span class="stat-item">
                    <el-icon><ChatDotRound /></el-icon>
                    留言: {{ productInfo.comments ? productInfo.comments.length : 0 }}
                  </span>
                </div>

                <div class="seller-info">
                  <h3>卖家信息</h3>
                  <el-card shadow="never" class="seller-card">
                    <div class="seller-details">
                      <div class="seller-avatar">
                        <el-avatar :size="50" :src="sellerInfo.avatar">
                          {{ sellerInfo.username ? sellerInfo.username.charAt(0) : '用' }}
                        </el-avatar>
                      </div>
                      <div class="seller-text">
                        <p class="seller-name">{{ sellerInfo.username || '未知用户' }}</p>
                        <p class="seller-college">{{ sellerInfo.college || '' }}</p>
                        <p class="seller-major">{{ sellerInfo.major || '' }}</p>
                        <el-rate
                          v-if="sellerInfo.rating"
                          :model-value="sellerInfo.rating"
                          disabled
                          show-score
                          text-color="#ff9900"
                          score-template="{value}分"
                          size="small"
                        />
                      </div>
                    </div>
                  </el-card>
                </div>

                <div class="action-buttons">
                  <el-button 
                    type="primary" 
                    size="large" 
                    :loading="favoriteLoading"
                    @click="handleFavorite"
                    class="favorite-btn"
                    :class="{ 'is-favorite': isFavorite }"
                  >
                    <el-icon>
                      <Star v-if="!isFavorite" />
                      <StarFilled v-else />
                    </el-icon>
                    {{ isFavorite ? '已收藏' : '收藏商品' }}
                  </el-button>
                  <el-button 
                    type="success" 
                    size="large" 
                    @click="showContactDialog = true"
                    class="contact-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    联系卖家
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-divider />
          
          <!-- 商品描述 -->
          <div class="product-description-section">
            <h3>商品描述</h3>
            <div class="description-content">
              <p>{{ productInfo.description || '暂无详细描述' }}</p>
            </div>
            
            <div v-if="productInfo.tags && productInfo.tags.length > 0" class="product-tags">
              <el-tag
                v-for="tag in productInfo.tags"
                :key="tag"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <!-- 商品留言区域 -->
          <div class="comments-section">
            <h3>商品留言 ({{ comments.length }})</h3>
            
            <!-- 留言列表 -->
            <div class="comments-list" v-if="comments.length > 0">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.username }}</span>
                  <span class="comment-time">{{ formatTime(comment.created_time) }}</span>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </div>
            </div>
            
            <div v-else class="no-comments">
              <p>暂无留言，快来第一个留言吧！</p>
            </div>
            
            <!-- 添加留言表单 -->
            <div class="add-comment">
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="3"
                placeholder="请输入留言内容..."
                maxlength="500"
                show-word-limit
                class="comment-input"
              />
              <div class="comment-actions">
                <el-button 
                  type="primary" 
                  @click="addComment"
                  :disabled="!newComment.trim()"
                  :loading="commentLoading"
                >
                  发表留言
                </el-button>
              </div>
            </div>
          </div>

          <!-- 联系卖家对话框 -->
          <el-dialog
            v-model="showContactDialog"
            title="联系卖家"
            width="600px"
          >
            <div class="contact-dialog">
              <el-card shadow="never">
                <template #header>
                  <div class="contact-header">
                    <h3>卖家信息</h3>
                  </div>
                </template>
                <div class="seller-contact-info">
                  <p><strong>卖家：</strong>{{ sellerInfo.username || '未知用户' }}</p>
                  <p><strong>学院：</strong>{{ sellerInfo.college || '暂无' }}</p>
                  <p><strong>专业：</strong>{{ sellerInfo.major || '暂无' }}</p>
                  <p><strong>信誉评分：</strong>{{ sellerInfo.rating || '暂无' }}</p>
                  <p><strong>邮箱：</strong>{{ sellerInfo.email || '暂无' }}</p>
                  <p><strong>手机：</strong>{{ sellerInfo.phone || '暂无' }}</p>
                  <p><strong>微信：</strong>{{ sellerInfo.wechat || '暂无' }}</p>
                  <p><strong>QQ：</strong>{{ sellerInfo.qq || '暂无' }}</p>
                </div>
              </el-card>

              <div class="message-section">
                <h4>发送消息</h4>
                <el-input
                  v-model="privateMessage"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您想对卖家说的话..."
                  maxlength="1000"
                  show-word-limit
                  class="message-input"
                />
                <div class="message-actions">
                  <el-button 
                    type="primary" 
                    @click="sendPrivateMessage"
                    :disabled="!privateMessage.trim()"
                    :loading="messageLoading"
                  >
                    发送消息
                  </el-button>
                  <el-button @click="showContactDialog = false">取消</el-button>
                </div>
              </div>

              <!-- 快速联系方式 -->
              <div class="quick-contact">
                <h4>快速联系</h4>
                <div class="contact-buttons">
                  <el-button 
                    v-if="sellerInfo.phone" 
                    type="primary" 
                    @click="handlePhoneContact"
                    class="contact-button"
                  >
                    <el-icon><Phone /></el-icon>
                    拨打电话
                  </el-button>
                  <el-button 
                    v-if="sellerInfo.wechat" 
                    type="success" 
                    @click="handleWechatContact"
                    class="contact-button"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    复制微信
                  </el-button>
                  <el-button 
                    v-if="sellerInfo.qq" 
                    type="warning" 
                    @click="handleQQContact"
                    class="contact-button"
                  >
                    <el-icon><Comment /></el-icon>
                    复制QQ
                  </el-button>
                </div>
              </div>
            </div>
          </el-dialog>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { Star, StarFilled, View, ChatDotRound, Phone, Comment } from '@element-plus/icons-vue'
import mockDataService from '@/services/mockDataService'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ProductDetail',
  components: {
    Star,
    StarFilled,
    View,
    ChatDotRound,
    Phone,
    Comment
  },
  data() {
    return {
      productInfo: {},
      sellerInfo: {},
      isFavorite: false,
      favoriteLoading: false,
      loading: false,
      showContactDialog: false,
      mainImage: '',
      productImages: [],
      
      // 留言相关
      comments: [],
      newComment: '',
      commentLoading: false,
      
      // 私信相关
      privateMessage: '',
      messageLoading: false
    }
  },
  async mounted() {
    // 确保页面滚动到顶部
    this.scrollToTop()
    await this.loadProductDetail()
    await this.checkFavoriteStatus()
    this.loadComments()
  },
  watch: {
    '$route': {
      handler: 'scrollToTop',
      immediate: false
    }
  },
  computed: {
    getCategoryName() {
      return (categoryId) => mockDataService.getCategoryName(categoryId)
    }
  },
  methods: {
    scrollToTop() {
      // 多种方式确保滚动到顶部
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // 给DOM一些时间更新
      this.$nextTick(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    },

    async loadProductDetail() {
      this.loading = true
      const productId = this.$route.params.id
      
      console.log('正在加载商品详情，ID:', productId)
      
      try {
        // 使用 mockDataService 获取商品详情
        const product = mockDataService.getProductById(productId)
        
        if (product) {
          this.productInfo = product
          this.sellerInfo = product.seller_info || {}
          
          // 处理商品图片
          this.productImages = mockDataService.processProductImages(product)
          this.mainImage = this.productImages[0] || ''
          
          console.log('商品详情加载成功:', this.productInfo)
        } else {
          this.$message.error('商品不存在')
          this.productInfo = {
            title: '商品不存在',
            description: '该商品不存在或已被删除。',
            price: 0,
            condition: 'unknown',
            category_id: '',
            view_count: 0,
            favorite_count: 0
          }
          this.sellerInfo = {}
          this.productImages = []
        }
        
      } catch (error) {
        console.error('加载商品详情失败:', error)
        this.$message.error('加载商品详情失败')
      } finally {
        this.loading = false
        // 数据加载完成后再次确保滚动位置正确
        this.$nextTick(this.scrollToTop)
      }
    },

    async checkFavoriteStatus() {
      const userId = this.getCurrentUserId()
      const productId = this.$route.params.id
      
      if (!userId) {
        console.log('用户未登录，无法检查收藏状态')
        return
      }
      
      try {
        this.isFavorite = mockDataService.checkFavoriteStatus(userId, productId)
        console.log('收藏状态检查结果:', { 
          userId, 
          productId, 
          isFavorite: this.isFavorite 
        })
      } catch (error) {
        console.error('检查收藏状态失败:', error)
        this.isFavorite = false
      }
    },

    async handleFavorite() {
      const userId = this.getCurrentUserId()
      const productId = this.$route.params.id
      
      console.log('收藏操作:', { 
        userId, 
        productId, 
        isFavorite: this.isFavorite 
      })
      
      if (!userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.favoriteLoading = true
      
      try {
        if (this.isFavorite) {
          // 取消收藏
          const success = mockDataService.removeFavorite(userId, productId)
          if (success) {
            this.isFavorite = false
            this.productInfo.favorite_count = Math.max(0, (this.productInfo.favorite_count || 1) - 1)
            this.$message.success('已取消收藏')
            console.log('取消收藏成功')
          } else {
            this.$message.warning('取消收藏失败')
          }
        } else {
          // 添加收藏
          const favorite = mockDataService.addFavorite(userId, productId)
          if (favorite) {
            this.isFavorite = true
            this.productInfo.favorite_count = (this.productInfo.favorite_count || 0) + 1
            this.$message.success('收藏成功')
            console.log('添加收藏成功:', favorite)
          } else {
            this.$message.warning('收藏失败')
          }
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        this.$message.error('操作失败，请稍后重试')
      } finally {
        this.favoriteLoading = false
      }
    },

    // 留言相关方法
    loadComments() {
      const productId = this.$route.params.id
      this.comments = mockDataService.getProductComments(productId)
      console.log('加载留言:', this.comments)
    },

    async addComment() {
      const userId = this.getCurrentUserId()
      const productId = this.$route.params.id
      
      if (!userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      if (!this.newComment.trim()) {
        this.$message.warning('请输入留言内容')
        return
      }
      
      this.commentLoading = true
      
      try {
        const userInfo = this.getCurrentUserInfo()
        const comment = mockDataService.addComment(
          productId, 
          userId, 
          userInfo.username || '匿名用户', 
          this.newComment.trim()
        )
        
        if (comment) {
          this.$message.success('留言成功')
          this.newComment = ''
          this.loadComments() // 重新加载留言列表
          this.loadProductDetail() // 更新商品信息中的留言计数
        } else {
          this.$message.error('留言失败')
        }
      } catch (error) {
        console.error('留言失败:', error)
        this.$message.error('留言失败，请稍后重试')
      } finally {
        this.commentLoading = false
      }
    },

    // 私信相关方法
    async sendPrivateMessage() {
      const userId = this.getCurrentUserId()
      const productId = this.$route.params.id
      
      if (!userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      if (!this.privateMessage.trim()) {
        this.$message.warning('请输入消息内容')
        return
      }
      
      this.messageLoading = true
      
      try {
        const userInfo = this.getCurrentUserInfo()
        const message = mockDataService.sendMessage(
          userId,
          userInfo.username || '匿名用户',
          this.sellerInfo.id,
          this.sellerInfo.username,
          productId,
          this.privateMessage.trim()
        )
        
        if (message) {
          this.$message.success('消息发送成功')
          this.privateMessage = ''
          this.showContactDialog = false
          
          // 跳转到消息页面
          this.$router.push('/messages')
        } else {
          this.$message.error('消息发送失败')
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        this.$message.error('发送消息失败，请稍后重试')
      } finally {
        this.messageLoading = false
      }
    },

    // 快速联系方法
    handlePhoneContact() {
      if (this.sellerInfo.phone) {
        ElMessageBox.confirm(
          `确定要拨打卖家电话 ${this.sellerInfo.phone} 吗？`,
          '拨打电话',
          {
            confirmButtonText: '拨打',
            cancelButtonText: '取消',
            type: 'info'
          }
        ).then(() => {
          // 模拟拨打电话（实际项目中可以调用 tel: 协议）
          window.location.href = `tel:${this.sellerInfo.phone}`
          this.$message.success('正在拨打电话...')
        }).catch(() => {
          // 用户取消
        })
      }
    },

    handleWechatContact() {
      if (this.sellerInfo.wechat) {
        this.copyToClipboard(this.sellerInfo.wechat)
        this.$message.success('微信已复制到剪贴板')
      }
    },

    handleQQContact() {
      if (this.sellerInfo.qq) {
        this.copyToClipboard(this.sellerInfo.qq)
        this.$message.success('QQ号已复制到剪贴板')
      }
    },

    // 复制到剪贴板
    copyToClipboard(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },

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
    },

    getCurrentUserId() {
      // 从 localStorage 获取用户ID
      const userInfoStr = localStorage.getItem('userInfo')
      console.log('获取用户信息:', userInfoStr)
      
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          // 关键：优先使用 student_id，这是你的登录系统使用的标识
          const userId = userInfo.student_id || userInfo.id || userInfo.userId
          console.log('解析出的用户ID:', userId)
          return userId
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      
      // 如果都没有，尝试从 localStorage 直接获取
      const userId = localStorage.getItem('userId')
      console.log('从localStorage获取的用户ID:', userId)
      
      return userId || 'mock-user-1'
    },

    getCurrentUserInfo() {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          return JSON.parse(userInfoStr)
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      return {
        username: '匿名用户',
        student_id: 'unknown'
      }
    }
  }
}
</script>

<style scoped>
.product-detail-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-x: hidden;
}

.product-detail-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.product-detail {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.detail-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 600px;
  width: 100%;
}

.product-image-gallery {
  position: sticky;
  top: 20px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: #409eff;
}

.product-info {
  padding: 0 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
  word-break: break-word;
}

.price-section {
  margin-bottom: 20px;
}

.product-price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 12px;
}

.original-price {
  font-size: 16px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.condition-tag, .category-tag {
  font-size: 14px;
}

.product-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  color: #606266;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.seller-info {
  margin-bottom: 20px;
}

.seller-info h3 {
  margin-bottom: 12px;
  color: #303133;
}

.seller-card {
  border: 1px solid #e4e7ed;
}

.seller-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.seller-text {
  flex: 1;
}

.seller-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.seller-college, .seller-major {
  font-size: 14px;
  color: #606266;
  margin-bottom: 2px;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  gap: 15px;
  padding-top: 20px;
}

.favorite-btn, .contact-btn {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

.favorite-btn.is-favorite {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.favorite-btn.is-favorite:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.product-description-section {
  margin-top: 30px;
}

.product-description-section h3 {
  margin-bottom: 16px;
  color: #303133;
}

.description-content {
  line-height: 1.6;
  color: #606266;
  font-size: 15px;
  margin-bottom: 20px;
  white-space: pre-line;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-bottom: 4px;
}

/* 留言区域样式 */
.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.comments-section h3 {
  margin-bottom: 20px;
  color: #303133;
}

.comments-list {
  margin-bottom: 30px;
}

.comment-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  line-height: 1.5;
  color: #606266;
  white-space: pre-line;
}

.no-comments {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.add-comment {
  margin-top: 20px;
}

.comment-input {
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

/* 联系对话框样式 */
.contact-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.contact-header {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.seller-contact-info {
  padding: 10px 0;
}

.seller-contact-info p {
  margin-bottom: 8px;
  line-height: 1.5;
}

.message-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.message-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.message-input {
  margin-bottom: 16px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 快速联系样式 */
.quick-contact {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.quick-contact h4 {
  margin-bottom: 12px;
  color: #303133;
}

.contact-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.contact-button {
  flex: 1;
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail {
    padding: 12px;
  }
  
  .main-image {
    height: 300px;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .seller-details {
    flex-direction: column;
    text-align: center;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .product-stats {
    gap: 10px;
  }
  
  .stat-item {
    font-size: 14px;
  }
  
  .contact-buttons {
    flex-direction: column;
  }
  
  .contact-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .product-detail-wrapper {
    padding: 0;
  }
  
  .product-detail {
    padding: 8px;
  }
  
  .image-thumbnails {
    justify-content: center;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .product-meta {
    justify-content: center;
  }
}
</style>