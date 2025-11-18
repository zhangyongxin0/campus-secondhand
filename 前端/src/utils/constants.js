// 百度AI配置
export const BAIDU_AI_CONFIG = {
  APP_ID: '120651538',
  API_KEY: 'r0lIFD6lE9HuI2lyQw3G13lK',
  SECRET_KEY: 'Nx6szrbn5CVsX5zx7lSWy9tJJpHaK5jK'
};

// 验证百度AI配置
export const validateAIConfig = () => {
  const { API_KEY, SECRET_KEY } = BAIDU_AI_CONFIG;
  const isValid = !!(API_KEY && SECRET_KEY && API_KEY !== 'your_api_key' && SECRET_KEY !== 'your_secret_key');
  
  console.log('百度AI配置验证:', {
    hasApiKey: !!API_KEY,
    hasSecretKey: !!SECRET_KEY,
    isValid: isValid
  });
  
  return isValid;
};

// 商品分类映射表
export const CATEGORY_MAPPING = {
  // 电子产品
  '手机': '电子产品',
  '电脑': '电子产品',
  '笔记本电脑': '电子产品',
  '平板电脑': '电子产品',
  '耳机': '电子产品',
  '相机': '电子产品',
  '智能手机': '电子产品',
  '电子设备': '电子产品',
  '科技产品': '电子产品',
  '通讯工具': '电子产品',
  '鼠标': '电子产品',
  '键盘': '电子产品',
  '显示器': '电子产品',
  '充电器': '电子产品',
  '音响': '电子产品',
  'U盘': '电子产品',
  '移动电源': '电子产品',
  '手表': '电子产品',
  '智能手表': '电子产品',

  // 图书资料
  '书籍': '图书资料',
  '教材': '图书资料',
  '小说': '图书资料',
  '课本': '图书资料',
  '学习资料': '图书资料',
  '教育': '图书资料',
  '图书': '图书资料',
  '杂志': '图书资料',

  // 学习用品
  '文具': '学习用品',
  '笔': '学习用品',
  '书包': '学习用品',
  '计算器': '学习用品',
  '尺子': '学习用品',
  '橡皮': '学习用品',
  '笔记本': '学习用品',
  '文件夹': '学习用品',
  '订书机': '学习用品',
  '剪刀': '学习用品',
  '胶水': '学习用品',

  // 生活用品
  '水杯': '生活用品',
  '台灯': '生活用品',
  '餐具': '生活用品',
  '眼镜': '生活用品',
  '雨伞': '生活用品',
  '化妆品': '生活用品',
  '洗漱用品': '生活用品',
  '床上用品': '生活用品',
  '收纳箱': '生活用品',
  '电风扇': '生活用品',
  '热水壶': '生活用品',
  '吹风机': '生活用品',

  // 服装鞋帽
  '衣服': '服装鞋帽',
  '鞋子': '服装鞋帽',
  '裤子': '服装鞋帽',
  '服装': '服装鞋帽',
  '运动鞋': '服装鞋帽',
  '运动服': '服装鞋帽',

  // 运动器材
  '篮球': '运动器材',
  '足球': '运动器材',
  '羽毛球': '运动器材',
  '自行车': '运动器材',
  '运动装备': '运动器材',
  '体育用品': '运动器材',
  '健身器材': '运动器材',
  '球类': '运动器材',
  '瑜伽垫': '运动器材',
  '哑铃': '运动器材',
  '跳绳': '运动器材',
  '滑板': '运动器材',
  '轮滑': '运动器材'
};

// 商品分类列表
export const CATEGORIES = [
  { category_id: 1, category_name: '电子产品' },
  { category_id: 2, category_name: '图书资料' },
  { category_id: 3, category_name: '学习用品' },
  { category_id: 4, category_name: '生活用品' },
  { category_id: 5, category_name: '服装鞋帽' },
  { category_id: 6, category_name: '运动器材' },
  { category_id: 7, category_name: '其他' }
];

// 表单验证规则
export const FORM_RULES = {
  title: [
    { required: true, message: '请输入商品标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, max: 99999, message: '价格范围: 0.01 - 99999 元', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择商品成色', trigger: 'change' }
  ]
};

// 商品成色选项
export const CONDITION_OPTIONS = [
  { label: '全新', value: 'new' },
  { label: '九成新', value: 'like_new' },
  { label: '八成新', value: 'good' },
  { label: '七成新', value: 'fair' },
  { label: '六成新及以下', value: 'poor' }
];

// AI识别状态映射
export const AI_STATUS_MAP = {
  high: { text: '识别可信度高', color: 'success' },
  medium: { text: '识别可信度中等', color: 'warning' },
  low: { text: '识别可信度较低', color: 'danger' }
};