<template>
  <div id="app">
    <!-- 使用头部组件 -->
    <Header 
      :userInfo="userInfo" 
      @logout="handleLogout" 
    />

    <main class="app-main">
      <!-- 使用 router-view 显示当前路由对应的页面 -->
      <router-view 
        :userInfo="userInfo"
        @login-success="handleLoginSuccess"
        @register-success="handleRegisterSuccess"
      />
    </main>

    <el-footer class="app-footer">
      <div class="footer-content">
        <p>广东药科大学 - 校园二手交易平台</p>
        <p>后端API地址: http://localhost:5000</p>
      </div>
    </el-footer>
  </div>
</template>

<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  },
  data() {
    return {
      userInfo: null
    }
  },
  methods: {
    handleLogout() {
      this.userInfo = null
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      this.$message.success('已退出登录')
      // 退出后跳转到首页
      this.$router.push('/')
    },
    handleRegisterSuccess() {
      this.$message.success('注册成功，请登录')
      // 注册成功后跳转到登录页
      this.$router.push('/login')
    },
    handleLoginSuccess(userData) {
      // 确保用户信息包含所有必要字段
      this.userInfo = {
        student_id: userData.student_id,
        name: userData.name,
        college: userData.college || '未设置',
        major: userData.major || '未设置',
        email: userData.email || '未设置',
        phone: userData.phone || '未设置',
        token: userData.token
      }
      this.$message.success('登录成功')
      // 登录成功后跳转到首页
      this.$router.push('/')
    }
  },
  mounted() {
    // 检查本地存储的登录状态
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      try {
        this.userInfo = JSON.parse(savedUserInfo)
      } catch (e) {
        console.error('解析用户信息失败:', e)
        localStorage.removeItem('userInfo')
      }
    }
  },
  watch: {
    userInfo: {
      handler(newUserInfo) {
        if (newUserInfo) {
          localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
        } else {
          localStorage.removeItem('userInfo')
        }
      },
      deep: true
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

body {
  font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding: 0;
  max-width: none;
  margin: 0;
  width: 100%;
  overflow-y: visible;
  min-height: calc(100vh - 140px);
}

.app-footer {
  background: #303133;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
  flex-shrink: 0;
}

.footer-content p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.8);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100%;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.router-view-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.el-main {
  padding: 0 !important;
  overflow: visible !important;
}

.el-card {
  margin-bottom: 20px;
}

.el-card__body {
  overflow: visible;
}

@media (max-width: 768px) {
  .app-main {
    padding: 0;
    min-height: calc(100vh - 120px);
  }
  
  .app-footer {
    padding: 15px;
  }
  
  .page-container {
    padding: 10px;
  }
}

.home-page,
.products-page,
.product-detail-page,
.search-page {
  min-height: 100%;
  overflow: visible;
}

.scroll-container {
  overflow-y: auto;
  height: 100%;
}

.page-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>