import axios from 'axios'

class SearchService {
  // 关键词搜索 - 确保总是返回正确的数据结构
  async searchProducts(params) {
    try {
      console.log('🔍 搜索参数:', params)
      
      // 检查是否是开发环境，如果是则直接使用模拟数据
      if (import.meta.env.MODE === 'development') {
        console.log('🔄 开发环境，使用模拟数据')
        return await this.mockSearchProducts(params)
      }
      
      // 生产环境使用真实API
      const response = await axios.get('/api/search', { params })
      console.log('✅ 真实API搜索响应:', response.data)
      
      // 确保返回正确的数据结构
      return this.ensureSearchResultStructure(response.data)
      
    } catch (error) {
      console.error('❌ 搜索失败，使用模拟数据:', error)
      // 任何错误都使用模拟数据
      return await this.mockSearchProducts(params)
    }
  }

  // 获取热门搜索词
  async getHotKeywords(limit = 6) {
    try {
      const response = await axios.get('/api/search/recommend', {
        params: { limit }
      })
      return response.data.keywords || []
    } catch (error) {
      console.log('获取热门搜索词失败，使用默认关键词')
      return ['教材', '手机', '电脑', '自行车', '耳机', '课本']
    }
  }

  // 分类搜索
  async searchByCategory(categoryId, params = {}) {
    try {
      const response = await axios.get('/api/search/category', {
        params: { category_id: categoryId, ...params }
      })
      return this.ensureSearchResultStructure(response.data)
    } catch (error) {
      console.error('分类搜索失败:', error)
      return await this.mockSearchProducts({ ...params, category_id: categoryId })
    }
  }

  // 图片搜索
  async searchByImage(imageData) {
    try {
      const response = await axios.post('/api/search/image', {
        image_data: imageData
      })
      return this.ensureSearchResultStructure(response.data)
    } catch (error) {
      console.error('图片搜索失败:', error)
      return await this.mockImageSearchResults()
    }
  }

  // 确保搜索返回正确的数据结构
  ensureSearchResultStructure(data) {
    if (!data || typeof data !== 'object') {
      console.warn('搜索返回数据格式不正确，使用默认结构')
      return this.getDefaultSearchResult()
    }
    
    // 确保包含必要的字段
    return {
      products: data.products || data.data || [],
      total_count: data.total_count || data.total || 0,
      total_pages: data.total_pages || Math.ceil((data.total_count || data.total || 0) / 12),
      search_time: data.search_time || 0.5,
      ...data // 保留其他字段
    }
  }

  // 获取默认搜索结果结构
  getDefaultSearchResult() {
    return {
      products: [],
      total_count: 0,
      total_pages: 0,
      search_time: 0
    }
  }

  // 模拟关键词搜索 - 修复数据结构
  async mockSearchProducts(params) {
    console.log('🎭 模拟搜索参数:', params)
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockProducts = [
      {
        id: 1,
        product_id: 1,
        title: '计算机科学导论教材',
        description: '计算机科学导论课程教材，几乎全新，无笔记',
        price: 25.00,
        condition: 'like_new',
        category_name: '图书资料',
        images: [],
        created_at: '2024-01-15T10:30:00Z',
        seller_info: {
          name: '张同学',
          college: '计算机学院',
          major: '计算机科学与技术'
        }
      },
      {
        id: 2,
        product_id: 2,
        title: '无线蓝牙耳机',
        description: '品牌无线蓝牙耳机，音质清晰，续航时间长',
        price: 80.00,
        condition: 'good',
        category_name: '数码产品',
        images: [],
        created_at: '2024-01-14T16:20:00Z',
        seller_info: {
          name: '李同学',
          college: '电子信息学院',
          major: '通信工程'
        }
      },
      {
        id: 3,
        product_id: 3,
        title: 'Java编程思想',
        description: 'Java编程经典教材，适合计算机专业学生',
        price: 30.00,
        condition: 'fair',
        category_name: '图书资料',
        images: [],
        created_at: '2024-01-13T09:15:00Z',
        seller_info: {
          name: '王同学',
          college: '软件学院',
          major: '软件工程'
        }
      },
      {
        id: 4,
        product_id: 4,
        title: '二手自行车',
        description: '校园代步自行车，车况良好',
        price: 150.00,
        condition: 'fair',
        category_name: '生活用品',
        images: [],
        created_at: '2024-01-12T14:45:00Z',
        seller_info: {
          name: '赵同学',
          college: '机械学院',
          major: '机械工程'
        }
      },
      {
        id: 5,
        product_id: 5,
        title: '运动鞋',
        description: '品牌运动鞋，适合跑步和日常穿着',
        price: 60.00,
        condition: 'good',
        category_name: '服装鞋帽',
        images: [],
        created_at: '2024-01-11T11:20:00Z',
        seller_info: {
          name: '陈同学',
          college: '体育学院',
          major: '体育教育'
        }
      },
      {
        id: 6,
        product_id: 6,
        title: '英语四级词汇书',
        description: '英语四级考试必备词汇书',
        price: 15.00,
        condition: 'fair',
        category_name: '图书资料',
        images: [],
        created_at: '2024-01-10T09:30:00Z',
        seller_info: {
          name: '刘同学',
          college: '外国语学院',
          major: '英语'
        }
      },
      {
        id: 7,
        product_id: 7,
        title: 'iPhone 13',
        description: 'iPhone 13 手机，功能完好，外观漂亮',
        price: 2800.00,
        condition: 'like_new',
        category_name: '数码产品',
        images: [],
        created_at: '2024-01-09T14:20:00Z',
        seller_info: {
          name: '钱同学',
          college: '信息学院',
          major: '信息工程'
        }
      },
      {
        id: 8,
        product_id: 8,
        title: '笔记本电脑',
        description: '轻薄笔记本电脑，适合学习使用',
        price: 3200.00,
        condition: 'good',
        category_name: '数码产品',
        images: [],
        created_at: '2024-01-08T10:15:00Z',
        seller_info: {
          name: '孙同学',
          college: '计算机学院',
          major: '软件工程'
        }
      }
    ]
    
    let filteredProducts = [...mockProducts]
    
    // 关键词过滤
    if (params.keyword && params.keyword.trim()) {
      const keyword = params.keyword.toLowerCase().trim()
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
      )
    }
    
    // 分类过滤
    if (params.category_id) {
      const categoryMap = {
        '1': '数码产品',
        '2': '图书资料',
        '3': '学习用品',
        '4': '生活用品',
        '5': '服装鞋帽',
        '6': '运动器材',
        '7': '其他'
      }
      const categoryName = categoryMap[params.category_id]
      if (categoryName) {
        filteredProducts = filteredProducts.filter(product => 
          product.category_name === categoryName
        )
      }
    }
    
    // 排序
    if (params.sort_by && params.sort_by !== 'default') {
      switch (params.sort_by) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price)
          break
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'popular':
          // 模拟收藏数
          filteredProducts.forEach(product => {
            product.favorite_count = Math.floor(Math.random() * 50)
          })
          filteredProducts.sort((a, b) => b.favorite_count - a.favorite_count)
          break
      }
    }
    
    // 分页
    const page = params.page || 1
    const pageSize = params.page_size || 12
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    // 确保返回正确的数据结构
    const result = {
      products: paginatedProducts,
      total_count: filteredProducts.length,
      total_pages: Math.ceil(filteredProducts.length / pageSize),
      search_time: 0.8,
      keyword: params.keyword || ''
    }
    
    console.log('📦 模拟搜索结果:', result)
    return result
  }

  // 模拟图片搜索结果
  async mockImageSearchResults() {
    console.log('🎭 模拟图片搜索')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      products: [
        {
          id: 2,
          product_id: 2,
          title: '无线蓝牙耳机',
          description: '品牌无线蓝牙耳机，音质清晰，续航时间长',
          price: 80.00,
          condition: 'good',
          category_name: '数码产品',
          images: [],
          created_at: '2024-01-14T16:20:00Z',
          seller_info: {
            name: '李同学',
            college: '电子信息学院',
            major: '通信工程'
          }
        },
        {
          id: 7,
          product_id: 7,
          title: '有线耳机',
          description: '高品质有线耳机，音质出色',
          price: 45.00,
          condition: 'like_new',
          category_name: '数码产品',
          images: [],
          created_at: '2024-01-09T14:30:00Z',
          seller_info: {
            name: '周同学',
            college: '音乐学院',
            major: '音乐表演'
          }
        }
      ],
      total_count: 2,
      search_keyword: '耳机',
      confidence: 0.85,
      search_time: 1.2
    }
  }

  // 测试搜索连接
  async testSearchConnection() {
    try {
      const response = await axios.get('/api/search', {
        params: { keyword: 'test', page: 1, page_size: 1 }
      })
      return { connected: true, data: response.data }
    } catch (error) {
      return { connected: false, error: error.message }
    }
  }
}

export default new SearchService()