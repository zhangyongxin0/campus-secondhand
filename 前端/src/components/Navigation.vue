<template>
  <el-menu
    mode="horizontal"
    background-color="#409EFF"
    text-color="#fff"
    active-text-color="#ffd04b"
    class="nav-menu"
  >
    <el-menu-item index="home" @click="emitShowPage('home')">
      <el-icon><House /></el-icon>首页
    </el-menu-item>
    
    <!-- 未登录状态 -->
    <template v-if="!userInfo">
      <el-menu-item index="register" @click="emitShowPage('register')">
        <el-icon><User /></el-icon>注册
      </el-menu-item>
      <el-menu-item index="login" @click="emitShowPage('login')">
        <el-icon><Lock /></el-icon>登录
      </el-menu-item>
    </template>
    
    <!-- 已登录状态 -->
    <template v-else>
      <el-menu-item index="publish" @click="emitShowPage('publish')">
        <el-icon><Plus /></el-icon>发布商品
      </el-menu-item>
      <el-menu-item index="products" @click="emitShowPage('products')">
        <el-icon><Goods /></el-icon>浏览商品
      </el-menu-item>
      <el-menu-item index="favorites" @click="emitShowPage('favorites')">
        <el-icon><Star /></el-icon>我的收藏
      </el-menu-item>
      
      <!-- 用户信息下拉菜单 -->
      <el-sub-menu index="user" class="user-menu">
        <template #title>
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ getUserInitial }}
            </el-avatar>
            <span class="user-name">{{ userInfo.name || userInfo.student_id }}</span>
          </div>
        </template>
        
        <!-- 用户信息展示 -->
        <div class="user-details">
          <div class="user-header">
            <el-avatar :size="48" class="detail-avatar">
              {{ getUserInitial }}
            </el-avatar>
            <div class="user-basic">
              <div class="user-display-name">{{ userInfo.name }}</div>
              <div class="user-student-id">{{ userInfo.student_id }}</div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="user-info-list">
            <div class="info-item">
              <span class="info-label">学院：</span>
              <span class="info-value">{{ userInfo.college || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">专业：</span>
              <span class="info-value">{{ userInfo.major || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱：</span>
              <span class="info-value">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机：</span>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>
          </div>
          
          <el-divider />
          
          <!-- 功能菜单 -->
          <el-menu-item @click="showUserProfile">
            <el-icon><User /></el-icon>个人中心
          </el-menu-item>
          <el-menu-item @click="emitShowPage('favorites')">
            <el-icon><Star /></el-icon>我的收藏
          </el-menu-item>
          <el-menu-item @click="showMyProducts">
            <el-icon><Goods /></el-icon>我的商品
          </el-menu-item>
          <el-divider />
          <el-menu-item @click="emitLogout" class="logout-item">
            <el-icon><SwitchButton /></el-icon>退出登录
          </el-menu-item>
        </div>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script>
import { 
  House, User, Lock, Plus, Goods, Star, SwitchButton 
} from '@element-plus/icons-vue'

export default {
  name: 'Navigation',
  components: {
    House, User, Lock, Plus, Goods, Star, SwitchButton
  },
  props: {
    userInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['show-page', 'logout'],
  computed: {
    getUserInitial() {
      if (this.userInfo && this.userInfo.name) {
        return this.userInfo.name.charAt(0).toUpperCase()
      }
      return 'U'
    }
  },
  methods: {
    emitShowPage(page) {
      this.$emit('show-page', page)
    },
    emitLogout() {
      this.$emit('logout')
    },
    showUserProfile() {
      this.$message.info('个人中心功能开发中...')
    },
    showMyProducts() {
      this.$message.info('我的商品功能开发中...')
    }
  }
}
</script>

<style scoped>
.user-menu {
  margin-left: auto !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: #fff;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 用户详情样式 */
.user-details {
  padding: 16px;
  min-width: 280px;
  background: white;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.user-basic {
  flex: 1;
}

.user-display-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.user-student-id {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.user-info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 13px;
  color: #303133;
  text-align: right;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-item {
  color: #f56c6c !important;
}

.logout-item:hover {
  background-color: #fef0f0 !important;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.nav-menu .el-menu-item,
.nav-menu .el-sub-menu {
  height: 60px;
  line-height: 60px;
}

/* 下拉菜单样式调整 */
:deep(.el-sub-menu__title) {
  padding: 0 12px !important;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 40px !important;
  line-height: 40px !important;
  margin: 2px 0;
}
</style>