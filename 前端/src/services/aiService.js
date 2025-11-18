import { BAIDU_AI_CONFIG, CATEGORY_MAPPING, validateAIConfig } from '@/utils/constants'

class AIService {
  constructor() {
    this.accessToken = null
    this.tokenExpireTime = null
    this.isConfigValid = validateAIConfig()
    this.useProxy = true // 强制使用代理模式
    console.log('AI服务初始化:', { 
      configValid: this.isConfigValid,
      useProxy: this.useProxy
    })
  }

  // 检查AI服务状态
  checkAIStatus() {
    return this.isConfigValid
  }

  // 获取百度AI访问令牌 - 使用后端代理
  async getAccessToken() {
    if (!this.isConfigValid) {
      throw new Error('AI配置无效，请检查API_KEY和SECRET_KEY')
    }

    // 如果token存在且未过期，直接返回
    if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime) {
      return this.accessToken
    }

    try {
      console.log('正在通过后端代理获取百度AI访问令牌...')
      
      // 使用后端代理接口
      const response = await fetch('/api/baidu-ai/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`获取token失败: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(`百度AI认证失败: ${result.error}`)
      }

      this.accessToken = result.data.access_token
      this.tokenExpireTime = Date.now() + (result.data.expires_in - 60) * 1000 // 提前60秒刷新
      
      console.log('百度AI访问令牌获取成功')
      return this.accessToken
    } catch (error) {
      console.error('获取百度AI访问令牌失败:', error)
      throw new Error('AI服务暂时不可用，请稍后重试')
    }
  }

  // 图片识别商品信息 - 🔥 强制使用模拟识别
  async recognizeProduct(imageFile) {
    // 🔥 暂时强制使用模拟识别，绕过百度AI问题
    console.log('使用模拟识别（百度AI服务调用异常）...');
    return await this.recognizeProductMock(imageFile);
  }

  // 解析识别结果 - 支持多种API格式
  parseRecognitionResult(result, apiUsed = 'advanced_general') {
    let productName = '未知物体';
    let confidence = 0;
    let items = [];

    // 根据不同的API返回格式解析
    if (apiUsed === 'realtime_product' && result.result && Array.isArray(result.result)) {
      // 商品识别API格式
      items = result.result;
      if (items.length > 0) {
        productName = items[0].name || '未知商品';
        confidence = items[0].score || 0;
      }
    } else if (apiUsed === 'advanced_general' && result.result && Array.isArray(result.result)) {
      // 通用物体识别API格式
      items = result.result;
      if (items.length > 0) {
        productName = items[0].keyword || items[0].root || '未知物体';
        confidence = items[0].score || 0;
      }
    } else {
      throw new Error('无法解析识别结果');
    }

    if (items.length === 0) {
      throw new Error('未识别到任何物体信息');
    }

    // 根据物体名称推断分类
    const category = this.inferCategory(productName);
    const confidenceType = this.getConfidenceType(confidence);

    console.log('解析后的识别结果:', {
      productName,
      confidence,
      category,
      confidenceType,
      apiUsed,
      itemsCount: items.length
    });

    return {
      productName,
      confidence,
      category,
      confidenceType,
      rawResult: result,
      apiUsed: apiUsed,
      allItems: items.slice(0, 3) // 返回前3个识别结果
    };
  }

  // 模拟识别功能（当百度AI不可用时使用）
  async recognizeProductWithFallback(imageFile) {
    try {
      console.log('尝试使用百度AI识别...')
      // 先尝试真实识别
      return await this.recognizeProduct(imageFile)
    } catch (error) {
      console.warn('百度AI识别失败，使用模拟识别:', error.message)
      // 如果真实识别失败，使用模拟识别
      return await this.recognizeProductMock(imageFile)
    }
  }

  // 模拟识别 - 增强版
  async recognizeProductMock(imageFile) {
    console.log('使用智能模拟识别...');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    // 根据文件名猜测商品类型
    const fileName = imageFile.name ? imageFile.name.toLowerCase() : '';
    
    let guessedResults = [];
    
    // 根据文件名关键词猜测商品类型
    if (fileName.includes('phone') || fileName.includes('手机')) {
      guessedResults = [
        { productName: '智能手机', confidence: 0.88, category: '电子产品' },
        { productName: '手机配件', confidence: 0.75, category: '电子产品' }
      ];
    } else if (fileName.includes('laptop') || fileName.includes('电脑') || fileName.includes('笔记本')) {
      guessedResults = [
        { productName: '笔记本电脑', confidence: 0.92, category: '电子产品' },
        { productName: '平板电脑', confidence: 0.78, category: '电子产品' }
      ];
    } else if (fileName.includes('book') || fileName.includes('书')) {
      guessedResults = [
        { productName: '教材书籍', confidence: 0.85, category: '图书资料' },
        { productName: '小说文学', confidence: 0.72, category: '图书资料' }
      ];
    } else if (fileName.includes('shoe') || fileName.includes('鞋')) {
      guessedResults = [
        { productName: '运动鞋', confidence: 0.80, category: '服装鞋帽' },
        { productName: '休闲鞋', confidence: 0.68, category: '服装鞋帽' }
      ];
    } else if (fileName.includes('bottle') || fileName.includes('杯')) {
      guessedResults = [
        { productName: '水杯', confidence: 0.75, category: '生活用品' },
        { productName: '保温杯', confidence: 0.65, category: '生活用品' }
      ];
    } else if (fileName.includes('basketball') || fileName.includes('篮球')) {
      guessedResults = [
        { productName: '篮球', confidence: 0.82, category: '运动器材' },
        { productName: '运动器材', confidence: 0.70, category: '运动器材' }
      ];
    } else {
      // 默认随机结果
      guessedResults = [
        { productName: '笔记本电脑', confidence: 0.85, category: '电子产品' },
        { productName: '智能手机', confidence: 0.82, category: '电子产品' },
        { productName: '教材书籍', confidence: 0.78, category: '图书资料' },
        { productName: '运动鞋', confidence: 0.75, category: '服装鞋帽' },
        { productName: '篮球', confidence: 0.72, category: '运动器材' },
        { productName: '水杯', confidence: 0.68, category: '生活用品' },
        { productName: '文具套装', confidence: 0.65, category: '学习用品' }
      ];
    }
    
    // 随机选择一个结果
    const randomResult = guessedResults[Math.floor(Math.random() * guessedResults.length)];
    
    const result = {
      productName: randomResult.productName,
      confidence: randomResult.confidence,
      category: randomResult.category,
      confidenceType: this.getConfidenceType(randomResult.confidence),
      isMock: true
    };
    
    console.log('模拟识别结果:', result);
    return result;
  }

  // 测试AI服务连接 - 使用后端代理
  async testAIConnection() {
    try {
      console.log('测试AI服务连接...')
      
      // 使用后端代理测试接口
      const response = await fetch('/api/baidu-ai/test')
      const result = await response.json()
      
      console.log('AI连接测试结果:', result)
      
      if (result.success && result.connected) {
        return {
          connected: true,
          message: result.message,
          token: result.token,
          mode: '代理模式'
        }
      } else {
        return {
          connected: false,
          message: result.message || 'AI服务连接失败',
          error: result,
          mode: '代理模式'
        }
      }
    } catch (error) {
      console.error('AI连接测试失败:', error)
      return {
        connected: false,
        message: error.message,
        error: error,
        mode: '代理模式'
      }
    }
  }

  // 其他方法保持不变...
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('文件参数为空'))
        return
      }

      const fileObj = file.raw || file
      
      if (!(fileObj instanceof File) && !(fileObj instanceof Blob)) {
        reject(new Error('参数不是有效的File或Blob对象'))
        return
      }

      const reader = new FileReader()
      
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      try {
        reader.readAsDataURL(fileObj)
      } catch (error) {
        reject(new Error('文件读取异常: ' + error.message))
      }
    })
  }

  inferCategory(productName) {
    if (!productName) return '其他'

    const lowerName = productName.toLowerCase()
    
    for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return category
      }
    }

    return '其他'
  }

  getConfidenceType(confidence) {
    if (confidence >= 0.8) {
      return 'high'
    } else if (confidence >= 0.5) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  // 生成商品标题
  generateTitle(productName, condition) {
    if (!productName) {
      return '优质二手商品'
    }
    
    const conditionText = this.getConditionText(condition)
    return `${conditionText}${productName}`
  }

  // 生成商品描述
  generateDescription(productName, condition, category) {
    const conditionText = this.getConditionText(condition)
    return `这是一件${conditionText}${productName}，属于${category}类别。商品状况良好，功能正常，欢迎咨询购买。`
  }

  // 获取成色文本
  getConditionText(condition) {
    const conditionMap = {
      'new': '全新',
      'like_new': '九成新',
      'good': '八成新', 
      'fair': '七成新',
      'poor': '六成新'
    }
    return conditionMap[condition] || '二手'
  }
}

// 创建单例实例
const aiService = new AIService()

export default aiService