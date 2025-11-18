import mockDataService from './mockDataService';

class ProductService {
  // 发布商品 - 修复用户ID获取问题
  static async publishProduct(productData, userInfo) {
    try {
      console.log('🚀 开始发布商品');
      console.log('📦 商品数据:', productData);
      console.log('👤 用户信息:', userInfo);

      // 检查用户信息
      if (!userInfo || !userInfo.token) {
        throw new Error('用户未登录，请重新登录');
      }

      // 关键修复：使用 student_id 作为 seller_id
      const sellerId = userInfo.user_id || userInfo.id || userInfo.student_id;
      
      if (!sellerId) {
        throw new Error('无法获取用户ID，请重新登录');
      }

      console.log('🆔 使用的卖家ID:', sellerId);

      // 处理图片数据
      let processedImages = [];
      if (productData.images && productData.images.length > 0) {
        console.log('🖼️ 处理图片中...');
        for (let i = 0; i < productData.images.length; i++) {
          const image = productData.images[i];
          try {
            const imageFile = image.raw || image;
            if (imageFile instanceof File) {
              const base64 = await this.fileToBase64(imageFile);
              processedImages.push(base64);
            } else if (image.url) {
              processedImages.push(image.url);
            }
          } catch (imageError) {
            console.warn(`图片 ${i} 处理失败:`, imageError);
          }
        }
      }

      // 构建请求数据 - 关键修复：使用正确的字段名
      const requestData = {
        seller_id: sellerId, // 使用 student_id 作为 seller_id
        title: productData.title || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0.01,
        category_id: productData.category_id || '',
        condition: productData.condition || '九成新',
        images: processedImages
      };

      console.log('📤 发送请求数据:', requestData);

      // 发送请求
      const API_BASE = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/product/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📨 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `请求失败: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ 发布成功:', result);
      return result;
      
    } catch (error) {
      console.error('❌ 发布商品失败:', error);
      throw error;
    }
  }

  // 将文件转换为base64
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // 智能发布
  static async smartPublish(productData, userInfo) {
    try {
      console.log('🎯 智能发布开始');
      
      // 检查服务状态
      const apiTest = await this.testAPIConnection();
      console.log('🌐 服务状态:', apiTest);
      
      if (apiTest.connected) {
        console.log('🔗 使用真实API发布');
        return await this.publishProduct(productData, userInfo);
      } else {
        console.log('🔄 使用模拟发布');
        return await this.mockPublishProduct(productData, userInfo);
      }
    } catch (error) {
      console.error('❌ 智能发布失败，使用模拟发布:', error);
      return await this.mockPublishProduct(productData, userInfo);
    }
  }

  // 模拟发布
  static async mockPublishProduct(productData, userInfo) {
    console.log('🎭 使用模拟发布');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const sellerId = userInfo?.user_id || userInfo?.student_id || 'mock-user';
      
      const productWithUser = {
        ...productData,
        seller_id: sellerId,
        seller_name: userInfo?.name || '测试用户',
        created_time: new Date().toISOString(),
        product_id: Date.now(),
        status: '已发布'
      };
      
      const savedProduct = mockDataService.addProduct(productWithUser);
      
      return {
        success: true,
        message: '商品发布成功（模拟）',
        product_id: savedProduct.product_id,
        data: savedProduct
      };
    } catch (error) {
      console.error('❌ 模拟发布失败:', error);
      return {
        success: false,
        message: '模拟发布失败: ' + error.message
      };
    }
  }

  // 验证表单数据
  static validateFormData(formData, userInfo) {
    const errors = [];
    
    if (!formData.title || formData.title.trim().length < 2) {
      errors.push('商品标题至少需要2个字符');
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
      errors.push('商品描述至少需要10个字符');
    }
    
    if (!formData.price || formData.price < 0.01) {
      errors.push('商品价格必须大于0');
    }
    
    if (!formData.category_id) {
      errors.push('请选择商品分类');
    }
    
    if (!formData.condition) {
      errors.push('请选择商品成色');
    }
    
    if (!userInfo || !userInfo.token) {
      errors.push('用户未登录，请重新登录');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // 测试API连接
  static async testAPIConnection() {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return { 
          connected: true, 
          message: 'API连接正常'
        };
      } else {
        return { 
          connected: false, 
          message: `服务返回错误: ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        connected: false, 
        message: `连接失败: ${error.message}` 
      };
    }
  }

  // 获取商品列表
  static async getProducts(params = {}) {
    try {
      const API_BASE = 'http://localhost:5000';
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/api/products?${queryString}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('真实API不可用');
      }
    } catch (error) {
      console.log('使用模拟商品数据');
      const mockProducts = mockDataService.getAllProducts();
      
      let filteredProducts = mockProducts;
      if (params.category_id) {
        filteredProducts = mockDataService.getProductsByCategory(params.category_id);
      }
      if (params.keyword) {
        filteredProducts = mockDataService.searchProducts(params.keyword);
      }
      
      const processedProducts = filteredProducts.map(product => ({
        ...product,
        images: mockDataService.processProductImages(product),
        category_name: mockDataService.getCategoryName(product.category_id),
        seller_name: product.seller_name || '测试用户'
      }));
      
      return {
        success: true,
        products: processedProducts,
        total_count: processedProducts.length,
        current_page: params.page || 1
      };
    }
  }

  // 获取商品详情
  static async getProductDetail(productId) {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/product/${productId}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('真实API不可用');
      }
    } catch (error) {
      console.log('使用模拟商品详情数据');
      const product = mockDataService.getProductById(parseInt(productId));
      
      if (product) {
        const processedProduct = {
          ...product,
          images: mockDataService.processProductImages(product),
          category_name: mockDataService.getCategoryName(product.category_id),
          seller_name: product.seller_name || '测试用户',
          seller_info: {
            name: product.seller_name || '测试用户',
            college: '计算机学院',
            major: '计算机科学与技术',
            email: 'user@example.com',
            phone: '138****1234'
          }
        };
        
        return {
          success: true,
          product_info: processedProduct,
          seller_info: processedProduct.seller_info
        };
      } else {
        return {
          success: false,
          message: '商品不存在'
        };
      }
    }
  }

  // 获取分类列表
  static async getCategories() {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/categories`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('真实API不可用');
      }
    } catch (error) {
      console.log('使用模拟分类数据');
      return {
        success: true,
        categories: [
          { category_id: 1, category_name: '图书资料' },
          { category_id: 2, category_name: '数码产品' },
          { category_id: 3, category_name: '生活用品' },
          { category_id: 4, category_name: '服饰鞋包' },
          { category_id: 5, category_name: '运动器材' },
          { category_id: 6, category_name: '其他' }
        ]
      };
    }
  }

  // 获取成色选项
  static getConditionOptions() {
    return [
      { value: '全新', label: '全新' },
      { value: '九成新', label: '九成新' },
      { value: '八成新', label: '八成新' },
      { value: '七成新', label: '七成新' },
      { value: '六成新及以下', label: '六成新及以下' }
    ];
  }

  // 搜索商品
  static async searchProducts(keyword, params = {}) {
    try {
      const API_BASE = 'http://localhost:5000';
      const searchParams = new URLSearchParams({
        keyword: keyword,
        ...params
      });
      
      const response = await fetch(`${API_BASE}/api/search?${searchParams}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('搜索API不可用');
      }
    } catch (error) {
      console.log('使用模拟搜索数据');
      const mockProducts = mockDataService.searchProducts(keyword);
      
      const processedProducts = mockProducts.map(product => ({
        ...product,
        images: mockDataService.processProductImages(product),
        category_name: mockDataService.getCategoryName(product.category_id),
        seller_info: {
          name: product.seller_name || '测试用户',
          college: '计算机学院',
          major: '计算机科学与技术'
        }
      }));
      
      return {
        success: true,
        products: processedProducts,
        total_count: processedProducts.length,
        keyword: keyword
      };
    }
  }

  // 验证图片
  static validateImage(file) {
    const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isJPGOrPNG) {
      return { valid: false, message: '只能上传 JPG/PNG/WEBP 格式的图片!' };
    }
    if (!isLt5M) {
      return { valid: false, message: '图片大小不能超过 5MB!' };
    }
    return { valid: true };
  }

  // AI识别相关方法
  static async testAIService() {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/baidu-ai/test`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('AI服务测试失败');
      }
    } catch (error) {
      return {
        success: false,
        message: `AI服务测试失败: ${error.message}`
      };
    }
  }

  static async getBaiduAIToken() {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/baidu-ai/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('获取AI令牌失败');
      }
    } catch (error) {
      return {
        success: false,
        message: `获取AI令牌失败: ${error.message}`
      };
    }
  }

  static async recognizeProduct(imageFile, accessToken) {
    try {
      const base64Image = await this.fileToBase64(imageFile);
      
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/baidu-ai/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          access_token: accessToken
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('商品识别失败');
      }
    } catch (error) {
      return {
        success: false,
        message: `商品识别失败: ${error.message}`
      };
    }
  }

  // 新增方法：删除商品
  static async deleteProduct(productId, userId) {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('删除商品失败');
      }
    } catch (error) {
      console.log('使用模拟删除');
      // 模拟删除成功
      return {
        success: true,
        message: '商品删除成功（模拟）'
      };
    }
  }

  // 新增方法：更新商品信息
  static async updateProduct(productId, productData, userInfo) {
    try {
      const API_BASE = 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('更新商品失败');
      }
    } catch (error) {
      console.log('使用模拟更新');
      return {
        success: true,
        message: '商品更新成功（模拟）',
        product_id: productId
      };
    }
  }

  // 新增方法：获取用户发布的商品
  static async getUserProducts(userId, params = {}) {
    try {
      const API_BASE = 'http://localhost:5000';
      const queryString = new URLSearchParams({
        user_id: userId,
        ...params
      }).toString();
      
      const response = await fetch(`${API_BASE}/api/user/products?${queryString}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('获取用户商品失败');
      }
    } catch (error) {
      console.log('使用模拟用户商品数据');
      const mockProducts = mockDataService.getProductsBySeller(userId);
      
      const processedProducts = mockProducts.map(product => ({
        ...product,
        images: mockDataService.processProductImages(product),
        category_name: mockDataService.getCategoryName(product.category_id)
      }));
      
      return {
        success: true,
        products: processedProducts,
        total_count: processedProducts.length
      };
    }
  }

  // 新增方法：获取商品状态选项
  static getStatusOptions() {
    return [
      { value: '待审核', label: '待审核' },
      { value: '已发布', label: '已发布' },
      { value: '已售出', label: '已售出' },
      { value: '已下架', label: '已下架' }
    ];
  }

  // 新增方法：格式化价格
  static formatPrice(price) {
    return parseFloat(price).toFixed(2);
  }

  // 新增方法：获取价格范围
  static getPriceRanges() {
    return [
      { min: 0, max: 50, label: '50元以下' },
      { min: 50, max: 100, label: '50-100元' },
      { min: 100, max: 200, label: '100-200元' },
      { min: 200, max: 500, label: '200-500元' },
      { min: 500, max: null, label: '500元以上' }
    ];
  }

  // 新增方法：根据价格范围筛选商品
  static async getProductsByPriceRange(minPrice, maxPrice, params = {}) {
    try {
      const allProducts = await this.getProducts(params);
      const filteredProducts = allProducts.products.filter(product => {
        const price = parseFloat(product.price);
        return price >= minPrice && (maxPrice === null || price <= maxPrice);
      });
      
      return {
        ...allProducts,
        products: filteredProducts,
        total_count: filteredProducts.length
      };
    } catch (error) {
      console.error('价格范围筛选失败:', error);
      throw error;
    }
  }
}

export default ProductService;