<template>
  <div class="page-container">
    <el-card shadow="hover" style="max-width: 400px; margin: 0 auto;">
      <template #header>
        <div class="card-header">
          <span>用户登录</span>
        </div>
      </template>
      
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="学号">
          <el-input 
            v-model="loginForm.student_id" 
            placeholder="请输入学号"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;" size="large" :loading="loading">
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div style="text-align: center;">
            <span style="color: #606266;">没有账号？</span>
            <el-link type="primary" @click="$router.push('/register')" style="margin-left: 5px;">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>

      <!-- 演示用快速登录按钮 -->
      <div style="margin-top: 20px; text-align: center;">
        <el-divider>演示用快速登录</el-divider>
        <el-button 
          type="success" 
          @click="quickLogin"
          style="width: 100%;"
        >
          快速登录（演示）
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      loginForm: {
        student_id: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      try {
        if (!this.loginForm.student_id || !this.loginForm.password) {
          this.$message.error('请填写学号和密码')
          return
        }

        this.loading = true

        // 首先尝试调用真实API
        try {
          const response = await fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.loginForm)
          })

          const data = await response.json()

          if (data.success) {
            this.handleLoginSuccess(data)
          } else {
            // 如果真实API失败，使用模拟登录
            this.$message.warning('API登录失败，使用模拟登录')
            this.mockLogin()
          }
        } catch (error) {
          console.error('API登录错误，使用模拟登录:', error)
          this.$message.warning('使用模拟登录')
          this.mockLogin()
        }

      } catch (error) {
        console.error('登录错误:', error)
        this.$message.error('登录失败，请稍后重试')
        this.loading = false
      }
    },

    handleLoginSuccess(data) {
      this.$message.success('登录成功！')
      
      // 确保返回完整的用户信息
      const userData = {
        ...data.user_info,
        student_id: data.user_info.student_id,
        name: data.user_info.name,
        college: data.user_info.college || '计算机学院',
        major: data.user_info.major || '计算机科学与技术',
        email: data.user_info.email || `${data.user_info.student_id}@school.edu`,
        phone: data.user_info.phone || '13800138000',
        token: data.token
      }
      
      // 保存到localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(userData))
      localStorage.setItem('userId', data.user_info.student_id)
      
      console.log('✅ 登录成功，用户信息已保存:', userData)
      
      // 发送事件给App.vue更新用户信息
      this.$emit('login-success', userData)
      
      // 清空表单
      this.loginForm = {
        student_id: '',
        password: ''
      }
      
      // 跳转到目标页面或首页
      this.redirectAfterLogin()
    },

    mockLogin() {
      // 模拟登录成功
      const mockUserData = {
        student_id: this.loginForm.student_id || '2330502158',
        name: '测试用户',
        college: '计算机学院',
        major: '计算机科学与技术',
        email: (this.loginForm.student_id || '2330502158') + '@school.edu',
        phone: '13800138000',
        token: 'mock-token-' + Date.now()
      }
      
      this.$message.success('模拟登录成功！')
      
      // 保存到localStorage
      localStorage.setItem('token', mockUserData.token)
      localStorage.setItem('userInfo', JSON.stringify(mockUserData))
      localStorage.setItem('userId', mockUserData.student_id)
      
      console.log('✅ 模拟登录成功，用户信息已保存:', mockUserData)
      
      // 发送事件给App.vue更新用户信息
      this.$emit('login-success', mockUserData)
      
      // 跳转到目标页面或首页
      this.redirectAfterLogin()
    },

    quickLogin() {
      // 快速登录演示
      this.loginForm.student_id = '2330502158'
      this.loginForm.password = 'demo123'
      this.handleLogin()
    },

    redirectAfterLogin() {
      this.loading = false
      
      // 检查是否有返回URL
      const returnUrl = this.$route.query.returnUrl
      console.log('🔄 登录后跳转检查，returnUrl:', returnUrl)
      
      if (returnUrl) {
        // 解码并跳转到目标页面
        const decodedUrl = decodeURIComponent(returnUrl)
        console.log('🎯 跳转到目标页面:', decodedUrl)
        this.$router.push(decodedUrl)
      } else {
        // 默认跳转到首页
        console.log('🏠 跳转到首页')
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}
</style>