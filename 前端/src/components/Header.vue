<template>
  <el-header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>校园二手交易平台</h1>
        <p class="logo-subtitle">广东药科大学</p>
      </div>
      <el-menu 
        mode="horizontal" 
        :default-active="activeIndex"
        class="navigation-menu"
        router
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/publish">发布商品</el-menu-item>
        
        <!-- 用户未登录时显示登录注册 -->
        <el-menu-item v-if="!userInfo" index="/login">登录</el-menu-item>
        <el-menu-item v-if="!userInfo" index="/register">注册</el-menu-item>
        
        <!-- 用户已登录时显示用户信息和退出 -->
        <el-sub-menu v-if="userInfo" index="user-menu">
          <template #title>
            <div class="user-menu-title">
              <el-icon><User /></el-icon>
              <span class="user-name">{{ userInfo.name }}</span>
              <div class="custom-badge" v-if="unreadCount > 0">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </div>
            </div>
          </template>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
          <el-menu-item index="/favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/messages" class="message-menu-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>我的消息</span>
            <div class="custom-badge menu-badge" v-if="unreadCount > 0">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </div>
          </el-menu-item>
          <el-menu-item @click="handleLogout" index="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </el-header>
</template>

<script>
import { User, Star, SwitchButton, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'Header',
  components: {
    User,
    Star,
    SwitchButton,
    ChatDotRound
  },
  props: {
    userInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activeIndex: '/',
      unreadCount: 0
    }
  },
  watch: {
    '$route.path': {
      handler(newPath) {
        this.activeIndex = newPath
      },
      immediate: true
    },
    // 监听用户信息变化，当用户登录时加载未读消息数
    userInfo: {
      handler(newUserInfo) {
        if (newUserInfo) {
          this.loadUnreadCount()
        } else {
          this.unreadCount = 0
        }
      },
      immediate: true
    }
  },
  methods: {
    handleLogout() {
      this.$emit('logout')
    },
    
    // 加载未读消息数量
    loadUnreadCount() {
      // 这里可以调用API获取真实的未读消息数量
      // 暂时使用模拟数据
      try {
        // 尝试从localStorage获取模拟的未读消息数
        const mockUnreadCount = localStorage.getItem('mockUnreadCount')
        if (mockUnreadCount) {
          this.unreadCount = parseInt(mockUnreadCount)
        } else {
          // 如果没有设置，随机生成1-5的未读消息数
          this.unreadCount = Math.floor(Math.random() * 5) + 1
          localStorage.setItem('mockUnreadCount', this.unreadCount.toString())
        }
      } catch (error) {
        console.error('获取未读消息数失败:', error)
        this.unreadCount = 0
      }
    },
    
    // 如果需要，可以添加一个方法来更新未读消息数
    updateUnreadCount(count) {
      this.unreadCount = count
      localStorage.setItem('mockUnreadCount', count.toString())
    }
  },
  mounted() {
    // 监听来自其他组件的未读消息数更新事件
    this.$emitter?.on('updateUnreadCount', this.updateUnreadCount)
  },
  beforeUnmount() {
    // 清理事件监听
    this.$emitter?.off('updateUnreadCount', this.updateUnreadCount)
  }
}
</script>

<style scoped>
.app-header {
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  height: 80px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  color: #409eff;
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.logo-subtitle {
  color: #666;
  margin: 0;
  font-size: 12px;
}

.navigation-menu {
  border-bottom: none;
  flex: 1;
  justify-content: flex-end;
}

/* 用户菜单标题容器 */
.user-menu-title {
  display: flex;
  align-items: center;
  position: relative;
  padding-right: 8px;
}

.user-name {
  margin: 0 8px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  height: 60px;
  line-height: 60px;
  border-bottom: 2px solid transparent;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  border-bottom-color: #409eff;
  color: #409eff;
}

:deep(.el-sub-menu__title) {
  height: 60px;
  line-height: 60px;
  position: relative;
}

/* 完全自定义徽章样式 - 解决偏移问题 */
.custom-badge {
  position: absolute;
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: 0 0 0 1.5px white;
  z-index: 10;
}

/* 用户菜单标题上的徽章 */
.user-menu-title .custom-badge {
  top: 10px;
  right: 0;
}

/* 消息菜单项特殊样式 */
.message-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-badge {
  position: static;
  margin-left: auto;
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
  
  .logo {
    text-align: center;
    margin-bottom: 10px;
  }
  
  .logo h1 {
    font-size: 20px;
  }
  
  .navigation-menu {
    width: 100%;
    justify-content: center;
  }
  
  .user-name {
    max-width: 60px;
  }
  
  .user-menu-title .custom-badge {
    top: 8px;
    right: -2px;
  }
}
</style>