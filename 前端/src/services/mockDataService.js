// 模拟数据管理服务
class MockDataService {
  constructor() {
    // 初始化时加载默认测试数据
    this.products = JSON.parse(localStorage.getItem('mock_products') || '[]');
    this.favorites = JSON.parse(localStorage.getItem('mock_favorites') || '[]');
    this.messages = JSON.parse(localStorage.getItem('mock_messages') || '[]');
    this.conversations = JSON.parse(localStorage.getItem('mock_conversations') || '[]');
    
    // 如果没有数据，初始化默认测试商品
    if (this.products.length === 0) {
      this.initializeDefaultProducts();
    }
    
    this.nextId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    this.nextFavoriteId = this.favorites.length > 0 ? Math.max(...this.favorites.map(f => f.id)) + 1 : 1;
    this.nextMessageId = this.messages.length > 0 ? Math.max(...this.messages.map(m => m.id)) + 1 : 1;
    this.nextConversationId = this.conversations.length > 0 ? Math.max(...this.conversations.map(c => c.id)) + 1 : 1;
  }

  // 初始化默认测试商品
  initializeDefaultProducts() {
    const defaultProducts = [
      {
        id: 1,
        title: '计算机科学导论教材',
        description: '计算机科学导论课程教材，2023年最新版，几乎全新，无任何笔记和划痕。适合计算机专业新生使用，内容全面，讲解详细。原价68元，现半价出售。',
        price: 25.00,
        original_price: 68.00,
        category_id: '2',
        condition: '九成新',
        images: [this.getMockImageUrl('2', 0)], // 图书资料分类，第一张图片
        status: 'active',
        created_time: '2024-01-15T10:30:00Z',
        updated_time: '2024-01-15T10:30:00Z',
        seller_info: {
          id: '101',
          username: '张小明',
          college: '计算机学院',
          major: '计算机科学与技术',
          avatar: '',
          rating: 4.8,
          email: 'zhangxiaoming@example.com',
          phone: '13800138001',
          wechat: 'zhangxiaoming123',
          qq: '123456789'
        },
        view_count: 156,
        favorite_count: 23,
        location: '大学城校区',
        tags: ['教材', '计算机', '专业课'],
        comments: [
          {
            id: 1,
            user_id: 'user001',
            username: '李同学',
            content: '这本书还有吗？我想买',
            created_time: '2024-01-16T10:30:00Z'
          },
          {
            id: 2,
            user_id: '101',
            username: '张小明',
            content: '还在的，可以联系我',
            created_time: '2024-01-16T11:15:00Z'
          }
        ]
      },
      {
        id: 2,
        title: 'AirPods Pro 无线蓝牙耳机',
        description: 'Apple AirPods Pro 第二代，主动降噪，空间音频功能。购买于2023年8月，保修期还剩10个月。配件齐全，包含原装充电盒、充电线。',
        price: 1200.00,
        original_price: 1899.00,
        category_id: '1',
        condition: '九成新',
        images: [this.getMockImageUrl('1', 1)], // 电子产品分类，第二张图片
        status: 'active',
        created_time: '2024-01-14T16:20:00Z',
        updated_time: '2024-01-14T16:20:00Z',
        seller_info: {
          id: '102',
          username: '李思思',
          college: '电子信息学院',
          major: '通信工程',
          avatar: '',
          rating: 4.9,
          email: 'lisisi@example.com',
          phone: '13800138002',
          wechat: 'lisisi456',
          qq: '987654321'
        },
        view_count: 289,
        favorite_count: 45,
        location: '东校区',
        tags: ['苹果', '耳机', '降噪'],
        comments: [
          {
            id: 1,
            user_id: 'user002',
            username: '王同学',
            content: '可以便宜点吗？',
            created_time: '2024-01-15T09:20:00Z'
          }
        ]
      },
      {
        id: 3,
        title: 'Java编程思想（第四版）',
        description: 'Java编程经典教材，包含完整的学习笔记和重点标注。书角有轻微磨损，内页干净无污渍。适合准备面试或深入学习Java的同学。',
        price: 35.00,
        original_price: 108.00,
        category_id: '2',
        condition: '七成新',
        images: [this.getMockImageUrl('2', 1)], // 图书资料分类，第二张图片
        status: 'active',
        created_time: '2024-01-13T09:15:00Z',
        updated_time: '2024-01-13T09:15:00Z',
        seller_info: {
          id: '103',
          username: '王浩然',
          college: '软件学院',
          major: '软件工程',
          avatar: '',
          rating: 4.7,
          email: 'wanghaoran@example.com',
          phone: '13800138003',
          wechat: 'wanghaoran789',
          qq: '456123789'
        },
        view_count: 98,
        favorite_count: 12,
        location: '西校区',
        tags: ['Java', '编程', '面试'],
        comments: []
      },
      {
        id: 4,
        title: '校园代步自行车',
        description: '凤凰牌山地自行车，26寸轮径，21速变速系统。车况良好，刹车灵敏，变速顺畅。刚更换了新轮胎和刹车片。适合校园内代步使用。',
        price: 280.00,
        original_price: 650.00,
        category_id: '4',
        condition: '八成新',
        images: [this.getMockImageUrl('4', 0)], // 生活用品分类，第一张图片
        status: 'active',
        created_time: '2024-01-12T14:45:00Z',
        updated_time: '2024-01-12T14:45:00Z',
        seller_info: {
          id: '104',
          username: '赵雨欣',
          college: '外国语学院',
          major: '英语',
          avatar: '',
          rating: 4.6,
          email: 'zhaoyuxin@example.com',
          phone: '13800138004',
          wechat: 'zhaoyuxin012',
          qq: '789456123'
        },
        view_count: 342,
        favorite_count: 31,
        location: '主校区',
        tags: ['自行车', '代步', '运动'],
        comments: []
      },
      {
        id: 5,
        title: 'Nike Air Force 1 运动鞋',
        description: 'Nike Air Force 1 白色经典款，尺码42。穿着次数不多，鞋底磨损轻微。已清洗干净，无任何破损。',
        price: 299.00,
        original_price: 799.00,
        category_id: '5',
        condition: '八成新',
        images: [this.getMockImageUrl('5', 0)], // 服装鞋帽分类，第一张图片
        status: 'active',
        created_time: '2024-01-11T11:20:00Z',
        updated_time: '2024-01-11T11:20:00Z',
        seller_info: {
          id: '105',
          username: '陈宇航',
          college: '体育学院',
          major: '体育教育',
          avatar: '',
          rating: 4.5,
          email: 'chenyuhang@example.com',
          phone: '13800138005',
          wechat: 'chenyuhang345',
          qq: '321654987'
        },
        view_count: 187,
        favorite_count: 18,
        location: '新校区',
        tags: ['耐克', '运动鞋', '潮鞋'],
        comments: []
      },
      {
        id: 6,
        title: '英语四级考试全套资料',
        description: '包含四级真题集、词汇书、作文模板和听力训练资料。所有资料都有详细笔记和重点标注。适合准备四级考试的同学。',
        price: 45.00,
        original_price: 120.00,
        category_id: '2',
        condition: '七成新',
        images: [this.getMockImageUrl('2', 2)], // 图书资料分类，第三张图片
        status: 'active',
        created_time: '2024-01-10T09:30:00Z',
        updated_time: '2024-01-10T09:30:00Z',
        seller_info: {
          id: '106',
          username: '刘婷婷',
          college: '经济学院',
          major: '金融学',
          avatar: '',
          rating: 4.8,
          email: 'liutingting@example.com',
          phone: '13800138006',
          wechat: 'liutingting678',
          qq: '654987321'
        },
        view_count: 123,
        favorite_count: 27,
        location: '大学城校区',
        tags: ['英语四级', '考试', '真题'],
        comments: []
      },
      {
        id: 7,
        title: 'MacBook Pro 13寸',
        description: '2022款 MacBook Pro 13寸，M2芯片，8GB内存，256GB存储。外观完好，性能强劲，适合编程和设计工作。',
        price: 6800.00,
        original_price: 9999.00,
        category_id: '1',
        condition: '九成新',
        images: [this.getMockImageUrl('1', 0)], // 电子产品分类，第一张图片
        status: 'active',
        created_time: '2024-01-09T14:20:00Z',
        updated_time: '2024-01-09T14:20:00Z',
        seller_info: {
          id: '107',
          username: '周杰',
          college: '信息工程学院',
          major: '人工智能',
          avatar: '',
          rating: 4.9,
          email: 'zhoujie@example.com',
          phone: '13800138007',
          wechat: 'zhoujie789',
          qq: '123789456'
        },
        view_count: 432,
        favorite_count: 67,
        location: '主校区',
        tags: ['苹果', '笔记本电脑', '编程'],
        comments: []
      },
      {
        id: 8,
        title: '篮球运动套装',
        description: '专业篮球运动套装，包含篮球、运动服和护具。适合篮球爱好者使用，质量很好。',
        price: 150.00,
        original_price: 280.00,
        category_id: '6',
        condition: '七成新',
        images: [this.getMockImageUrl('6', 0)], // 运动器材分类，第一张图片
        status: 'active',
        created_time: '2024-01-08T16:30:00Z',
        updated_time: '2024-01-08T16:30:00Z',
        seller_info: {
          id: '108',
          username: '吴强',
          college: '体育学院',
          major: '体育训练',
          avatar: '',
          rating: 4.6,
          email: 'wuqiang@example.com',
          phone: '13800138008',
          wechat: 'wuqiang123',
          qq: '456789123'
        },
        view_count: 89,
        favorite_count: 15,
        location: '新校区',
        tags: ['篮球', '运动', '体育'],
        comments: []
      }
    ];

    this.products = defaultProducts;
    this.saveToStorage();
  }

  // 保存到本地存储
  saveToStorage() {
    localStorage.setItem('mock_products', JSON.stringify(this.products));
    localStorage.setItem('mock_favorites', JSON.stringify(this.favorites));
    localStorage.setItem('mock_messages', JSON.stringify(this.messages));
    localStorage.setItem('mock_conversations', JSON.stringify(this.conversations));
  }

  // 添加商品
  addProduct(productData) {
    const product = {
      id: this.nextId++,
      title: productData.title,
      description: productData.description,
      price: parseFloat(productData.price),
      category_id: productData.category_id,
      condition: productData.condition,
      images: this.processImagesForStorage(productData.images || []),
      status: 'active',
      created_time: new Date().toISOString(),
      updated_time: new Date().toISOString(),
      seller_info: {
        id: productData.seller_id || 'mock-user-1',
        username: productData.seller_name || '当前用户',
        college: productData.college || '未知学院',
        major: productData.major || '未知专业',
        avatar: '',
        rating: 4.5,
        email: productData.email || '',
        phone: productData.phone || '',
        wechat: productData.wechat || '',
        qq: productData.qq || ''
      },
      view_count: 0,
      favorite_count: 0,
      location: productData.location || '大学城校区',
      tags: productData.tags || [],
      comments: []
    };

    this.products.unshift(product); // 新商品放在最前面
    this.saveToStorage();
    
    console.log('模拟商品已保存:', product);
    return product;
  }

  // 处理图片数据以便存储
  processImagesForStorage(images) {
    return images.map(image => {
      // 如果已经是URL字符串，直接返回
      if (typeof image === 'string') {
        return image;
      }
      
      // 如果是文件对象，转换为数据URL
      if (image.raw && image.raw instanceof File) {
        return this.fileToDataURL(image.raw);
      }
      
      // 其他情况返回默认图片
      return this.getMockImageUrl();
    });
  }

  // 文件转换为数据URL（同步版本，实际使用时需要异步）
  fileToDataURL(file) {
    // 在实际应用中，这里应该使用异步方式转换
    // 但为了简化，我们直接返回一个占位符
    console.warn('文件转换功能需要在真实环境中实现');
    return this.getMockImageUrl();
  }

  // 获取所有商品
  getAllProducts() {
    return this.products;
  }

  // 根据ID获取商品
  getProductById(id) {
    const product = this.products.find(product => 
      product.id === parseInt(id) || product.id === id
    );
    
    if (product) {
      // 增加浏览量
      product.view_count = (product.view_count || 0) + 1;
      this.saveToStorage();
    }
    
    return product;
  }

  // 根据分类获取商品
  getProductsByCategory(categoryId) {
    if (!categoryId) return this.products;
    return this.products.filter(product => product.category_id === categoryId);
  }

  // 搜索商品 - 修复版本
  searchProducts(keyword) {
    if (!keyword) return this.products;
    const lowerKeyword = keyword.toLowerCase();
    
    return this.products.filter(product => {
      // 检查标题和描述是否存在
      const titleMatch = product.title && product.title.toLowerCase().includes(lowerKeyword);
      const descriptionMatch = product.description && product.description.toLowerCase().includes(lowerKeyword);
      
      // 检查标签是否存在且匹配
      let tagsMatch = false;
      if (product.tags && Array.isArray(product.tags)) {
        tagsMatch = product.tags.some(tag => 
          tag && typeof tag === 'string' && tag.toLowerCase().includes(lowerKeyword)
        );
      }
      
      return titleMatch || descriptionMatch || tagsMatch;
    });
  }

  // 获取热门商品（按浏览量排序）
  getHotProducts(limit = 8) {
    return [...this.products]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, limit);
  }

  // 获取最新商品
  getNewestProducts(limit = 8) {
    return [...this.products]
      .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
      .slice(0, limit);
  }

  // 删除商品
  deleteProduct(id) {
    this.products = this.products.filter(product => product.id !== id);
    this.saveToStorage();
    return true;
  }

  // 更新商品
  updateProduct(id, updates) {
    const index = this.products.findIndex(product => product.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updated_time: new Date().toISOString()
      };
      this.saveToStorage();
      return this.products[index];
    }
    return null;
  }

  // 增加收藏数
  incrementFavoriteCount(productId) {
    const product = this.getProductById(productId);
    if (product) {
      product.favorite_count = (product.favorite_count || 0) + 1;
      this.saveToStorage();
      console.log('📈 增加收藏数:', productId, product.favorite_count);
    }
  }

  // 减少收藏数
  decrementFavoriteCount(productId) {
    const product = this.getProductById(productId);
    if (product && product.favorite_count > 0) {
      product.favorite_count = product.favorite_count - 1;
      this.saveToStorage();
      console.log('📉 减少收藏数:', productId, product.favorite_count);
    }
  }

  // 收藏功能相关方法 - 修复版本
  addFavorite(userId, productId) {
    console.log('⭐ 添加收藏:', { userId, productId });
    
    // 检查是否已经收藏
    const existingFavorite = this.favorites.find(
      fav => fav.user_id === userId && fav.product_id === productId
    );
    
    if (existingFavorite) {
      console.log('⚠️ 已经收藏过了');
      return existingFavorite; // 已经收藏过了
    }
    
    // 获取商品信息
    const product = this.getProductById(productId);
    if (!product) {
      console.log('❌ 商品不存在:', productId);
      return null;
    }
    
    const favorite = {
      id: this.nextFavoriteId++,
      user_id: userId,
      product_id: productId,
      product_info: { ...product }, // 保存完整的商品信息副本
      created_time: new Date().toISOString()
    };
    
    this.favorites.push(favorite);
    this.incrementFavoriteCount(productId);
    this.saveToStorage();
    
    console.log('✅ 添加收藏成功:', favorite);
    return favorite;
  }

  removeFavorite(userId, productId) {
    console.log('🗑️ 移除收藏:', { userId, productId });
    
    const index = this.favorites.findIndex(
      fav => fav.user_id === userId && fav.product_id === productId
    );
    
    if (index !== -1) {
      const removed = this.favorites.splice(index, 1)[0];
      this.decrementFavoriteCount(productId);
      this.saveToStorage();
      console.log('✅ 移除收藏成功:', removed);
      return true;
    }
    
    console.log('❌ 收藏记录不存在');
    return false;
  }

  checkFavoriteStatus(userId, productId) {
    const exists = this.favorites.some(
      fav => fav.user_id === userId && fav.product_id === productId
    );
    console.log('🔍 检查收藏状态:', { userId, productId, exists });
    return exists;
  }

  getUserFavorites(userId) {
    console.log('📚 获取用户收藏:', userId);
    
    const userFavorites = this.favorites.filter(fav => fav.user_id === userId);
    console.log('📖 用户收藏记录:', userFavorites);
    
    // 确保每个收藏都包含完整的商品信息
    const favoritesWithProductInfo = userFavorites.map(fav => {
      // 如果收藏记录中没有商品信息，从商品列表获取
      if (!fav.product_info) {
        const product = this.getProductById(fav.product_id);
        return {
          ...fav,
          product_info: product || {
            id: fav.product_id,
            title: '商品已删除',
            price: 0,
            condition: 'unknown',
            description: '该商品可能已被删除',
            images: []
          }
        };
      }
      return fav;
    });
    
    console.log('✅ 最终收藏列表:', favoritesWithProductInfo);
    return favoritesWithProductInfo;
  }

  // 留言功能相关方法
  addComment(productId, userId, username, content) {
    console.log('💬 添加留言:', { productId, userId, username, content });
    
    const product = this.getProductById(productId);
    if (!product) {
      console.log('❌ 商品不存在，无法添加留言');
      return null;
    }
    
    // 确保商品有comments数组
    if (!product.comments) {
      product.comments = [];
    }
    
    const comment = {
      id: product.comments.length > 0 ? Math.max(...product.comments.map(c => c.id)) + 1 : 1,
      user_id: userId,
      username: username,
      content: content,
      created_time: new Date().toISOString()
    };
    
    product.comments.push(comment);
    this.saveToStorage();
    
    console.log('✅ 添加留言成功:', comment);
    return comment;
  }

  getProductComments(productId) {
    const product = this.getProductById(productId);
    if (!product || !product.comments) {
      return [];
    }
    
    // 按时间倒序排列
    return [...product.comments].sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
  }

  // 私信功能相关方法
  sendMessage(senderId, senderName, receiverId, receiverName, productId, content) {
    console.log('📨 发送私信:', { senderId, senderName, receiverId, receiverName, productId, content });
    
    const message = {
      id: this.nextMessageId++,
      sender_id: senderId,
      sender_name: senderName,
      receiver_id: receiverId,
      receiver_name: receiverName,
      product_id: productId,
      content: content,
      created_time: new Date().toISOString(),
      read: false
    };
    
    this.messages.push(message);
    
    // 创建或更新对话
    this.createOrUpdateConversation(senderId, senderName, receiverId, receiverName, productId, content);
    
    this.saveToStorage();
    
    console.log('✅ 发送私信成功:', message);
    return message;
  }

  // 创建或更新对话
  createOrUpdateConversation(senderId, senderName, receiverId, receiverName, productId, content) {
    // 查找是否已存在对话
    const existingConversation = this.conversations.find(conv => 
      (conv.user1_id === senderId && conv.user2_id === receiverId && conv.product_id === productId) ||
      (conv.user1_id === receiverId && conv.user2_id === senderId && conv.product_id === productId)
    );
    
    if (existingConversation) {
      // 更新现有对话
      existingConversation.last_message = content;
      existingConversation.last_message_time = new Date().toISOString();
      existingConversation.unread_count = existingConversation.unread_count + 1;
    } else {
      // 创建新对话
      const conversation = {
        id: this.nextConversationId++,
        user1_id: senderId,
        user1_name: senderName,
        user2_id: receiverId,
        user2_name: receiverName,
        product_id: productId,
        product_title: this.getProductById(productId)?.title || '未知商品',
        last_message: content,
        last_message_time: new Date().toISOString(),
        unread_count: 1,
        created_time: new Date().toISOString()
      };
      
      this.conversations.push(conversation);
    }
  }

  // 获取用户对话列表
  getUserConversations(userId) {
    return this.conversations.filter(conv => 
      conv.user1_id === userId || conv.user2_id === userId
    ).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
  }

  // 标记对话为已读
  markConversationAsRead(conversationId) {
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.unread_count = 0;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // 清除对话记录
  clearConversation(conversationId) {
    const index = this.conversations.findIndex(conv => conv.id === conversationId);
    if (index !== -1) {
      this.conversations.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // 创建新对话
  createConversation(userId, recipientId, recipientName, firstMessage, productTitle) {
    const conversation = {
      id: this.nextConversationId++,
      user1_id: userId,
      user1_name: '当前用户',
      user2_id: recipientId,
      user2_name: recipientName,
      product_id: null,
      product_title: productTitle || '无相关商品',
      last_message: firstMessage,
      last_message_time: new Date().toISOString(),
      unread_count: 0,
      created_time: new Date().toISOString()
    };
    
    this.conversations.unshift(conversation);
    this.saveToStorage();
    
    return conversation;
  }

  getUserMessages(userId) {
    const userMessages = this.messages.filter(
      msg => msg.sender_id === userId || msg.receiver_id === userId
    );
    
    // 按时间倒序排列
    return userMessages.sort((a, b) => new Date(b.created_time) - new Date(a.created_time));
  }

  getUnreadMessageCount(userId) {
    return this.messages.filter(
      msg => msg.receiver_id === userId && !msg.read
    ).length;
  }

  markMessageAsRead(messageId) {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.read = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // 获取潜在收件人
  getPotentialRecipients() {
    // 从商品卖家信息中提取潜在收件人
    const sellers = this.products.map(product => product.seller_info);
    
    // 去重
    const uniqueSellers = sellers.filter((seller, index, self) => 
      index === self.findIndex(s => s.id === seller.id)
    );
    
    return uniqueSellers.map(seller => ({
      id: seller.id,
      name: seller.username
    }));
  }

  // 获取用户发布的商品
  getUserProducts(userId) {
    return this.products.filter(product => product.seller_info.id === userId)
      .map(product => ({
        id: product.id,
        title: product.title
      }));
  }

  // 清空所有模拟数据
  clearAllData() {
    this.products = [];
    this.favorites = [];
    this.messages = [];
    this.conversations = [];
    this.nextId = 1;
    this.nextFavoriteId = 1;
    this.nextMessageId = 1;
    this.nextConversationId = 1;
    this.saveToStorage();
  }

  // 重置为默认数据
  resetToDefault() {
    this.initializeDefaultProducts();
    this.nextId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
    this.favorites = [];
    this.nextFavoriteId = 1;
    this.messages = [];
    this.nextMessageId = 1;
    this.conversations = [];
    this.nextConversationId = 1;
    this.saveToStorage();
  }

  // 获取分类名称
  getCategoryName(categoryId) {
    const categories = {
      '1': '电子产品',
      '2': '图书资料',
      '3': '学习用品',
      '4': '生活用品',
      '5': '服装鞋帽',
      '6': '运动器材',
      '7': '其他'
    };
    return categories[categoryId] || '未知分类';
  }

  // 获取模拟图片URL（使用高质量的Unsplash图片）
  getMockImageUrl(categoryId = '7', imageIndex = 0) {
    const categoryImages = {
      '1': [ // 电子产品
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&auto=format', // 笔记本电脑
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&auto=format', // 耳机
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop&auto=format'  // 相机
      ],
      '2': [ // 图书资料
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&auto=format', // 书籍堆叠
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&auto=format', // 打开的书
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format'  // 学习资料
      ],
      '3': [ // 学习用品
        'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=300&fit=crop&auto=format', // 文具
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format', // 画笔
        'https://images.unsplash.com/photo-1596496050827-829948c6e356?w=400&h=300&fit=crop&auto=format'  // 计算器
      ],
      '4': [ // 生活用品
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format', // 家具
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&auto=format', // 餐具
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop&auto=format'  // 台灯
      ],
      '5': [ // 服装鞋帽
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop&auto=format', // 运动鞋
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop&auto=format', // 衣服
        'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=400&h=300&fit=crop&auto=format'  // 包包
      ],
      '6': [ // 运动器材
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format', // 健身器材
        'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=400&h=300&fit=crop&auto=format', // 篮球
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop&auto=format'  // 足球
      ],
      '7': [ // 其他
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&auto=format', // 杂物
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop&auto=format', // 艺术品
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format'  // 手工制品
      ]
    };
    
    const images = categoryImages[categoryId] || categoryImages['7'];
    const index = imageIndex % images.length; // 确保索引在范围内
    return images[index];
  }

  // 处理商品图片 - 修复版本
  processProductImages(product) {
    if (!product.images || product.images.length === 0) {
      // 如果没有图片，使用模拟图片
      return [this.getMockImageUrl(product.category_id)];
    }
    
    // 直接返回图片URL数组，不再使用 blob URL
    return product.images.map(image => {
      // 如果已经是有效的URL，直接返回
      if (typeof image === 'string' && 
          (image.startsWith('http') || image.startsWith('https') || image.startsWith('data:'))) {
        return image;
      }
      
      // 其他情况返回默认图片
      return this.getMockImageUrl(product.category_id);
    });
  }

  // 获取商品统计信息
  getProductStats() {
    return {
      total_products: this.products.length,
      total_views: this.products.reduce((sum, product) => sum + (product.view_count || 0), 0),
      total_favorites: this.products.reduce((sum, product) => sum + (product.favorite_count || 0), 0),
      total_user_favorites: this.favorites.length,
      total_messages: this.messages.length,
      total_conversations: this.conversations.length,
      categories: this.products.reduce((acc, product) => {
        const category = this.getCategoryName(product.category_id);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// 创建单例实例
export default new MockDataService();
