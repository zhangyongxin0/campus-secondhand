<template>
  <div class="page-container">
    <el-card shadow="hover" style="max-width: 500px; margin: 0 auto;">
      <template #header>
        <div class="card-header">
          <span>用户注册</span>
        </div>
      </template>
      
      <el-form :model="registerForm" label-width="80px">
        <el-form-item label="学号">
          <el-input 
            v-model="registerForm.student_id" 
            placeholder="请输入学号"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="姓名">
          <el-input 
            v-model="registerForm.name" 
            placeholder="请输入真实姓名"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="学院">
          <el-input 
            v-model="registerForm.college" 
            placeholder="请输入所在学院"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="专业">
          <el-input 
            v-model="registerForm.major" 
            placeholder="请输入专业"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" style="width: 100%;" size="large">
            立即注册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div style="text-align: center;">
            <span style="color: #606266;">已有账号？</span>
            <el-link type="primary" @click="$router.push('/login')" style="margin-left: 5px;">立即登录</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    return {
      registerForm: {
        student_id: '',
        password: '',
        name: '',
        college: '',
        major: ''
      }
    }
  },
  emits: ['register-success'],
  methods: {
    async handleRegister() {
      try {
        // 简单验证
        if (!this.registerForm.student_id || !this.registerForm.password || !this.registerForm.name) {
          this.$message.error('请填写完整信息')
          return
        }

        const response = await fetch('http://localhost:5000/api/user/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.registerForm)
        })

        const data = await response.json()

        if (data.success) {
          this.$message.success('注册成功！')
          // 发送事件给App.vue
          this.$emit('register-success')
          // 清空表单
          this.registerForm = {
            student_id: '',
            password: '',
            name: '',
            college: '',
            major: ''
          }
        } else {
          this.$message.error(data.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        this.$message.error('网络错误，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
</style>