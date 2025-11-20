import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: '校园二手交易平台 - 首页'
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/ProductsPage.vue'),
    meta: {
      title: '商品列表 - 校园二手交易平台'
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/components/publish/PublishPage.vue'),
    meta: {
      title: '发布商品 - 校园二手交易平台',
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      title: '登录 - 校园二手交易平台',
      guestOnly: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: {
      title: '注册 - 校园二手交易平台',
      guestOnly: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: {
      title: '用户资料 - 校园二手交易平台',
      requiresAuth: true
    }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: {
      title: '商品详情 - 校园二手交易平台'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchPage.vue'),
    meta: {
      title: '搜索商品 - 校园二手交易平台'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesPage.vue'),
    meta: {
      title: '我的收藏 - 校园二手交易平台',
      requiresAuth: true
    }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagesPage.vue'),
    meta: {
      title: '消息中心 - 校园二手交易平台',
      requiresAuth: true
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: { 
      template: `
        <div class="page-container">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>购物车</span>
              </div>
            </template>
            <div style="text-align: center; padding: 50px;">
              <h3>购物车功能开发中...</h3>
              <p>敬请期待</p>
              <el-button type="primary" @click="$router.push('/products')">继续购物</el-button>
            </div>
          </el-card>
        </div>
      `
    },
    meta: {
      title: '购物车 - 校园二手交易平台',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 修复滚动行为配置
  scrollBehavior(to, from, savedPosition) {
    console.log('滚动行为触发:', {
      to: to.path,
      from: from.path,
      savedPosition: savedPosition
    })
    
    // 如果前进后退操作有保存的位置，则返回到该位置
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(savedPosition)
        }, 300)
      })
    }
    
    // 否则滚动到顶部
    return new Promise((resolve) => {
      setTimeout(() => {
        // 确保DOM已经更新
        const scrollToTop = () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
        
        // 立即滚动一次
        scrollToTop()
        
        // 延迟再次滚动确保生效
        setTimeout(scrollToTop, 100)
        
        resolve({ top: 0, behavior: 'smooth' })
      }, 100)
    })
  }
})

// 检查用户是否已登录
function isUserLoggedIn() {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  console.log('登录状态检查:', { 
    hasToken: !!token, 
    hasUserInfo: !!userInfo,
    token: token,
    userInfo: userInfo ? JSON.parse(userInfo) : null
  })
  return !!(token || userInfo)
}

// 路由守卫 - 权限控制
router.beforeEach((to, from, next) => {
  console.log('=== 路由导航开始 ===')
  
  // 在路由切换前确保页面可以滚动
  document.body.style.overflow = 'auto'
  document.body.style.position = 'static'
  document.documentElement.style.overflow = 'auto'
  document.documentElement.style.position = 'static'
  
  // 移除可能阻止滚动的类
  document.body.classList.remove('no-scroll', 'overflow-hidden', 'fixed')
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  console.log('路由导航:', {
    from: from.path,
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    guestOnly: to.meta.guestOnly
  })

  const isLoggedIn = isUserLoggedIn()
  
  console.log('用户登录状态:', isLoggedIn)

  // 如果需要登录但未登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('需要登录，跳转到登录页，目标页面:', to.fullPath)
    const returnUrl = encodeURIComponent(to.fullPath)
    next(`/login?returnUrl=${returnUrl}`)
    return
  }

  // 如果仅限游客访问但已登录
  if (to.meta.guestOnly && isLoggedIn) {
    console.log('已登录用户访问游客页面，跳转到首页')
    next('/')
    return
  }

  console.log('允许访问:', to.path)
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 路由加载失败时重定向到首页
  window.location.href = '/'
})

// 路由导航成功 - 修复滚动问题
router.afterEach((to, from) => {
  console.log('✅ 成功导航到:', to.path)
  
  // 延迟确保页面可以滚动
  setTimeout(() => {
    // 强制重置滚动状态
    document.body.style.overflow = 'auto'
    document.body.style.position = 'static'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.position = 'static'
    
    // 移除所有可能阻止滚动的样式
    const allElements = document.querySelectorAll('*')
    allElements.forEach(el => {
      if (el.style.overflow === 'hidden') {
        el.style.overflow = 'auto'
      }
      if (el.style.position === 'fixed') {
        el.style.position = 'static'
      }
    })
    
    // 确保窗口可以滚动
    window.scrollTo(0, 0)
    
    // 额外延迟滚动到顶部，确保DOM完全渲染
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      
      // 再次检查并修复滚动
      const checkAndFixScroll = () => {
        const bodyStyle = window.getComputedStyle(document.body)
        const htmlStyle = window.getComputedStyle(document.documentElement)
        
        if (bodyStyle.overflow === 'hidden' || htmlStyle.overflow === 'hidden') {
          console.log('检测到滚动被阻止，正在修复...')
          document.body.style.overflow = 'auto'
          document.documentElement.style.overflow = 'auto'
        }
      }
      
      checkAndFixScroll()
    }, 200)
  }, 150)
  
  console.log('✅ 滚动修复已应用')
})

// 添加全局错误监听器
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

// 导出前添加一个全局滚动修复函数
window.fixPageScroll = function() {
  console.log('手动修复页面滚动...')
  document.body.style.overflow = 'auto'
  document.body.style.position = 'static'
  document.documentElement.style.overflow = 'auto'
  document.documentElement.style.position = 'static'
  
  // 滚动到顶部
  window.scrollTo(0, 0)
  
  return '页面滚动已修复'
}

console.log('✅ 路由配置加载完成，滚动修复已启用')

export default router
