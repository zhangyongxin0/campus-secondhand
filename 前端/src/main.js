import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 第一步：先使用路由
app.use(router)

// 第二步：再使用Element Plus
app.use(ElementPlus)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置axios - 修复基础URL问题
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
axios.defaults.timeout = 10000
axios.defaults.withCredentials = false // 暂时禁用，避免CORS问题

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    console.log(`发起请求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 修复消息提示问题
axios.interceptors.response.use(
  (response) => {
    console.log(`请求成功: ${response.config.url}`, response.data)
    return response.data
  },
  (error) => {
    console.error('请求失败:', error)
    
    // 延迟显示消息，确保Element Plus已初始化
    setTimeout(() => {
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            if (router.currentRoute.value.path !== '/login') {
              router.push('/login')
            }
            break
          case 403:
            showMessage('没有权限执行此操作', 'error')
            break
          case 404:
            showMessage('请求的资源不存在', 'error')
            break
          case 500:
            showMessage('服务器内部错误，请稍后重试', 'error')
            break
          default:
            showMessage(data?.message || '网络请求失败', 'error')
        }
      } else if (error.request) {
        showMessage('网络连接失败，请检查网络设置', 'error')
      } else {
        showMessage('请求配置错误', 'error')
      }
    }, 0)
    
    return Promise.reject(error)
  }
)

// 安全的消息提示函数
function showMessage(message, type = 'error') {
  // 确保Element Plus已加载
  if (typeof ElementPlus !== 'undefined') {
    // 使用Element Plus的ElMessage
    const { ElMessage } = ElementPlus
    if (ElMessage) {
      ElMessage({
        message,
        type,
        duration: 3000
      })
    }
  } else {
    // 降级处理
    console[type === 'error' ? 'error' : 'log'](message)
  }
}

// 将axios挂载到全局
app.config.globalProperties.$http = axios
window.axios = axios

// 全局配置
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 2000
}

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue应用错误:', err)
  console.error('错误组件:', instance)
  console.error('错误信息:', info)
}

// 全局属性 - 环境变量
app.config.globalProperties.$env = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL
}

// 开发环境调试信息
if (import.meta.env.MODE === 'development') {
  console.log('开发环境配置:')
  console.log('API基础地址:', axios.defaults.baseURL)
  console.log('当前模式:', import.meta.env.MODE)
}

app.mount('#app')

export default app