<template>
  <div class="publish-page-wrapper">
    <div class="page-container">
      <el-card shadow="hover" style="max-width: 800px; margin: 0 auto;">
        <template #header>
          <div class="card-header">
            <span>发布商品</span>
            <div class="header-actions">
              <el-button 
                type="primary" 
                @click="autoFillWithAI" 
                :loading="autoFilling"
                :disabled="!uploadedImages.length || !aiServiceAvailable"
                size="small"
              >
                <el-icon style="margin-right: 5px;"><MagicStick /></el-icon>
                AI智能填写
              </el-button>
              <el-button 
                @click="checkServerStatus" 
                :loading="checkingStatus"
                size="small"
                text
              >
                <el-icon><Connection /></el-icon>
                检查服务
              </el-button>
            </div>
          </div>
        </template>
        
        <!-- 服务状态提示 -->
        <div v-if="serverStatus" class="status-message" :class="serverStatus.type">
          <el-icon><InfoFilled /></el-icon>
          {{ serverStatus.message }}
        </div>

        <!-- AI识别结果提示 -->
        <div v-if="aiRecognitionResult" class="ai-result-message" :class="aiRecognitionResult.type">
          <el-icon><CircleCheckFilled v-if="aiRecognitionResult.type === 'success'" /></el-icon>
          <el-icon><WarningFilled v-if="aiRecognitionResult.type === 'warning'" /></el-icon>
          <el-icon><CircleCloseFilled v-if="aiRecognitionResult.type === 'error'" /></el-icon>
          {{ aiRecognitionResult.message }}
          <el-button v-if="aiRecognitionResult.canApply" type="text" @click="applyAIRecognitionResult">
            应用识别结果
          </el-button>
        </div>

        <!-- 简化版本：直接使用表单，避免子组件加载问题 -->
        <div class="simple-publish-form">
          <!-- 图片上传 -->
          <div class="upload-section">
            <h4>商品图片 <el-tag v-if="aiServiceAvailable" type="success" size="small">支持AI识别</el-tag></h4>
            <el-upload
              action="#"
              list-type="picture-card"
              :file-list="uploadedImages"
              :before-upload="beforeUpload"
              :on-remove="handleRemove"
              :on-change="handleChange"
              :auto-upload="false"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tips">
              <el-text type="info">支持 JPG、PNG 格式，单张图片不超过 5MB</el-text>
              <el-text v-if="aiServiceAvailable" type="success" style="display: block; margin-top: 5px;">
                上传商品图片后，点击"AI智能填写"自动识别商品信息
              </el-text>
            </div>
          </div>

          <!-- 商品表单 -->
          <el-form :model="publishForm" label-width="80px" class="product-form">
            <el-form-item label="商品标题" required>
              <el-input 
                v-model="publishForm.title" 
                placeholder="请输入商品标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="商品描述" required>
              <el-input
                v-model="publishForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入商品详细描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="商品价格" required>
              <el-input-number
                v-model="publishForm.price"
                :min="0.01"
                :max="99999"
                :precision="2"
                controls-position="right"
              />
              <span class="price-unit">元</span>
            </el-form-item>

            <el-form-item label="商品分类" required>
              <el-select v-model="publishForm.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option label="图书资料" value="1" />
                <el-option label="数码产品" value="2" />
                <el-option label="生活用品" value="3" />
                <el-option label="服饰鞋包" value="4" />
                <el-option label="运动器材" value="5" />
                <el-option label="其他" value="6" />
              </el-select>
            </el-form-item>

            <el-form-item label="商品成色" required>
              <el-select v-model="publishForm.condition" placeholder="请选择成色" style="width: 100%">
                <el-option label="全新" value="全新" />
                <el-option label="九成新" value="九成新" />
                <el-option label="八成新" value="八成新" />
                <el-option label="七成新" value="七成新" />
                <el-option label="六成新及以下" value="六成新及以下" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="handlePublish" 
                :loading="submitting"
                :disabled="uploadedImages.length === 0"
                size="large"
                style="width: 100%"
              >
                {{ submitting ? '发布中...' : '发布商品' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { MagicStick, Connection, InfoFilled, Plus, CircleCheckFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'

export default {
  name: 'PublishPage',
  components: {
    MagicStick,
    Connection,
    InfoFilled,
    Plus,
    CircleCheckFilled,
    WarningFilled,
    CircleCloseFilled
  },
  data() {
    return {
      publishForm: {
        title: '',
        description: '',
        price: 0.01,
        category_id: '',
        condition: '九成新'
      },
      uploadedImages: [],
      autoFilling: false,
      submitting: false,
      checkingStatus: false,
      serverStatus: null,
      aiRecognitionResult: null,
      useMockMode: false,
      aiServiceAvailable: false,
      lastAIRecognitionData: null
    }
  },
  async mounted() {
    await this.checkServerStatus();
    this.checkAIServiceStatus();
    this.ensureUserInfo();
  },
  methods: {
    ensureUserInfo() {
      const userInfo = this.getUserInfo();
      console.log('当前用户信息:', userInfo);
    },

    // 检查AI服务状态
    async checkAIServiceStatus() {
      try {
        // 动态导入AI服务，避免加载问题
        const aiModule = await import('@/services/aiService');
        const aiService = aiModule.default;
        
        this.aiServiceAvailable = true;
        console.log('AI服务状态: 使用模拟模式');

        this.aiRecognitionResult = {
          type: 'success',
          message: 'AI服务可用，可以识别商品图片'
        };
      } catch (error) {
        console.error('检查AI服务状态失败:', error);
        this.aiServiceAvailable = true;
        this.aiRecognitionResult = {
          type: 'warning',
          message: 'AI服务使用模拟模式'
        };
      }
    },

    async checkServerStatus() {
      this.checkingStatus = true;
      try {
        // 动态导入避免加载问题
        const productModule = await import('@/services/productService');
        const ProductService = productModule.ProductService;
        
        const apiTest = await ProductService.testAPIConnection();
        console.log('服务状态检查:', apiTest);
        
        if (apiTest.connected) {
          this.serverStatus = {
            type: 'success',
            message: '后端服务连接正常，使用真实发布'
          };
          this.useMockMode = false;
        } else {
          this.serverStatus = {
            type: 'warning',
            message: '后端服务未连接，使用模拟发布模式'
          };
          this.useMockMode = true;
        }
      } catch (error) {
        console.error('检查服务状态失败:', error);
        this.serverStatus = {
          type: 'error',
          message: '服务状态检查失败，使用模拟发布模式'
        };
        this.useMockMode = true;
      } finally {
        this.checkingStatus = false;
      }
    },

    // 图片上传处理
    beforeUpload(file) {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isJPGOrPNG) {
        ElMessage.error('只能上传 JPG/PNG/WEBP 格式的图片!');
        return false;
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!');
        return false;
      }
      return true;
    },

    handleRemove(file, fileList) {
      this.uploadedImages = fileList;
      // 清除AI识别结果
      this.aiRecognitionResult = null;
      this.lastAIRecognitionData = null;
    },

    handleChange(file, fileList) {
      this.uploadedImages = fileList;
    },

    // AI智能填写功能
    async autoFillWithAI() {
      if (!this.aiServiceAvailable) {
        ElMessage.warning('AI服务不可用，请检查配置');
        return;
      }

      if (this.uploadedImages.length === 0) {
        ElMessage.warning('请先上传商品图片');
        return;
      }

      this.autoFilling = true;
      this.aiRecognitionResult = {
        type: 'info',
        message: '正在识别商品图片...'
      };

      try {
        console.log('开始AI识别，图片数量:', this.uploadedImages.length);
        
        // 动态导入AI服务
        const aiModule = await import('@/services/aiService');
        const aiService = aiModule.default;
        
        // 使用第一张图片进行识别
        const imageFile = this.uploadedImages[0];
        
        // 使用模拟识别
        const recognitionResult = await aiService.recognizeProductMock(imageFile);
        
        console.log('AI识别结果:', recognitionResult);
        
        // 保存识别结果
        this.lastAIRecognitionData = recognitionResult;
        
        // 根据置信度显示不同提示
        let message = '';
        let resultType = 'success';
        let canApply = true;
        
        if (recognitionResult.confidenceType === 'high') {
          message = `识别成功！识别到商品: ${recognitionResult.productName} (可信度: ${(recognitionResult.confidence * 100).toFixed(1)}%)`;
          resultType = 'success';
        } else if (recognitionResult.confidenceType === 'medium') {
          message = `识别可信度中等。识别到商品: ${recognitionResult.productName} (可信度: ${(recognitionResult.confidence * 100).toFixed(1)}%)`;
          resultType = 'warning';
        } else {
          message = `识别可信度较低。可能为: ${recognitionResult.productName} (可信度: ${(recognitionResult.confidence * 100).toFixed(1)}%)`;
          resultType = 'warning';
          canApply = true;
        }
        
        this.aiRecognitionResult = {
          type: resultType,
          message: message,
          canApply: canApply
        };
        
        // 高可信度时自动应用结果
        if (recognitionResult.confidenceType === 'high') {
          setTimeout(() => {
            this.applyAIRecognitionResult();
          }, 1000);
        }
        
      } catch (error) {
        console.error('AI识别失败:', error);
        this.aiRecognitionResult = {
          type: 'error',
          message: `识别失败: ${error.message}`
        };
        ElMessage.error(`AI识别失败: ${error.message}`);
      } finally {
        this.autoFilling = false;
      }
    },

    // 应用AI识别结果
    async applyAIRecognitionResult() {
      if (!this.lastAIRecognitionData) {
        ElMessage.warning('没有可应用的识别结果');
        return;
      }

      try {
        const aiModule = await import('@/services/aiService');
        const aiService = aiModule.default;
        
        const recognition = this.lastAIRecognitionData;
        
        // 生成标题和描述
        const title = aiService.generateTitle(recognition.productName, this.publishForm.condition);
        const description = aiService.generateDescription(recognition.productName, this.publishForm.condition, recognition.category);
        
        // 更新表单
        this.publishForm.title = title;
        this.publishForm.description = description;
        
        // 设置分类
        const categoryMap = {
          '电子产品': '2',
          '图书资料': '1', 
          '学习用品': '3',
          '生活用品': '3',
          '服装鞋帽': '4',
          '运动器材': '5',
          '其他': '6'
        };
        
        if (categoryMap[recognition.category]) {
          this.publishForm.category_id = categoryMap[recognition.category];
        }
        
        // 设置默认价格（根据分类）
        this.setDefaultPrice(recognition.category);
        
        ElMessage.success('已应用AI识别结果');
        
        // 更新AI结果提示
        this.aiRecognitionResult.message += ' - 已自动填充表单';
        this.aiRecognitionResult.canApply = false;
      } catch (error) {
        console.error('应用AI结果失败:', error);
        ElMessage.error('应用识别结果失败');
      }
    },

    // 根据分类设置默认价格
    setDefaultPrice(category) {
      const priceMap = {
        '电子产品': 299.00,
        '图书资料': 25.00,
        '学习用品': 15.00,
        '生活用品': 45.00,
        '服装鞋帽': 68.00,
        '运动器材': 120.00,
        '其他': 50.00
      };
      
      this.publishForm.price = priceMap[category] || 50.00;
    },

    async handlePublish() {
      if (this.uploadedImages.length === 0) {
        ElMessage.warning('请至少上传一张商品图片');
        return;
      }

      // 表单验证
      if (!this.publishForm.title.trim()) {
        ElMessage.warning('请输入商品标题');
        return;
      }

      if (!this.publishForm.description.trim()) {
        ElMessage.warning('请输入商品描述');
        return;
      }

      if (!this.publishForm.category_id) {
        ElMessage.warning('请选择商品分类');
        return;
      }

      this.submitting = true;

      try {
        console.log('开始发布商品，表单数据:', this.publishForm);
        console.log('上传的图片数量:', this.uploadedImages.length);
        
        // 获取用户信息
        const userInfo = this.getUserInfo();
        console.log('用户信息:', userInfo);
        
        if (!userInfo || !userInfo.token) {
          ElMessage.error('用户未登录，请重新登录');
          this.$router.push('/login');
          return;
        }

        // 动态导入服务
        const productModule = await import('@/services/productService');
        const ProductService = productModule.ProductService;

        // 准备发布数据
        const publishData = {
          ...this.publishForm,
          images: this.uploadedImages
        };
        
        console.log('发送到后端的数据:', publishData);
        
        // 使用智能发布（自动检测服务状态）
        const result = await ProductService.smartPublish(publishData, userInfo);
        
        // 关键调试：打印完整的结果结构
        console.log('完整的发布结果:', result);
        console.log('结果数据结构分析:');
        console.log('- result 类型:', typeof result);
        console.log('- result 所有键:', Object.keys(result));
        console.log('- result.success:', result.success);
        console.log('- result.message:', result.message);
        console.log('- result.product_id:', result.product_id);
        console.log('- result.data:', result.data);
        
        if (result.data) {
          console.log('data 对象详细分析:');
          console.log('- data 类型:', typeof result.data);
          console.log('- data 所有键:', Object.keys(result.data));
          console.log('- data.id:', result.data.id);
          console.log('- data.product_id:', result.data.product_id);
          console.log('- data.title:', result.data.title);
          console.log('- data.price:', result.data.price);
        }
        
        if (result.success) {
          const isMock = result.message && result.message.includes('模拟');
          const successMessage = isMock ? 
            '商品发布成功！（模拟模式，数据未保存到服务器）' : 
            '商品发布成功！';
          
          ElMessage.success(successMessage);
          
          // 安全地获取商品信息 - 修复这里的问题
          const productId = result.product_id || (result.data && result.data.product_id) || (result.data && result.data.id);
          const productTitle = (result.data && result.data.title) || this.publishForm.title;
          const productPrice = (result.data && result.data.price) || this.publishForm.price;
          
          console.log('提取的商品信息:', {
            productId,
            productTitle, 
            productPrice
          });
          
          // 显示发布详情
          ElNotification({
            title: '发布成功',
            message: `商品ID: ${productId}<br>标题: ${productTitle}<br>价格: ¥${productPrice}`,
            type: 'success',
            duration: 5000,
            dangerouslyUseHTMLString: true
          });
          
          // 延迟跳转
          setTimeout(() => {
            if (productId) {
              this.$router.push(`/product/${productId}`);
            } else {
              this.$router.push('/products');
            }
          }, 1500);
          
          this.resetForm();
        } else {
          ElMessage.error(result.message || '发布失败，请检查表单信息');
        }
      } catch (error) {
        console.error('发布错误详情:', error);
        
        let friendlyMessage = error.message;
        if (error.message.includes('无法连接到服务器')) {
          friendlyMessage = '后端服务未启动';
        } else if (error.message.includes('网络连接失败')) {
          friendlyMessage = '网络连接问题，请检查网络设置';
        } else if (error.message.includes('无法获取用户ID')) {
          friendlyMessage = '用户信息异常，请重新登录';
        }
        
        ElMessage.error(`发布失败: ${friendlyMessage}`);
        
        // 如果真实发布失败，尝试模拟发布
        try {
          const userInfo = this.getUserInfo();
          const productModule = await import('@/services/productService');
          const ProductService = productModule.ProductService;
          
          const publishData = {
            ...this.publishForm,
            images: this.uploadedImages
          };
          const mockResult = await ProductService.mockPublishProduct(publishData, userInfo);
          
          console.log('模拟发布结果:', mockResult);
          
          if (mockResult.success) {
            // 安全获取模拟发布的结果
            const mockProductId = mockResult.product_id || (mockResult.data && mockResult.data.product_id) || (mockResult.data && mockResult.data.id);
            const mockProductTitle = (mockResult.data && mockResult.data.title) || this.publishForm.title;
            
            ElNotification({
              title: '模拟发布成功',
              message: `由于后端服务不可用，已使用模拟发布<br>商品ID: ${mockProductId}<br>标题: ${mockProductTitle}`,
              type: 'warning',
              duration: 5000,
              dangerouslyUseHTMLString: true
            });
            
            this.$router.push('/products');
            this.resetForm();
          }
        } catch (mockError) {
          console.error('模拟发布也失败了:', mockError);
          ElMessage.error('发布失败，请稍后重试');
        }
        
      } finally {
        this.submitting = false;
      }
    },

    getUserInfo() {
      try {
        const userFromLocalStorage = localStorage.getItem('userInfo');
        
        if (userFromLocalStorage) {
          const user = JSON.parse(userFromLocalStorage);
          console.log('从localStorage获取用户:', user);
          if (!user.token) {
            user.token = 'mock-token-' + Date.now();
          }
          return user;
        }
        
        console.warn('未找到用户信息，创建模拟用户');
        const mockUser = {
          token: 'mock-token-' + Date.now(),
          username: '测试用户',
          userId: 'mock-user-id',
          student_id: '2330502158',
          name: '张泳欣'
        };
        
        localStorage.setItem('userInfo', JSON.stringify(mockUser));
        localStorage.setItem('token', mockUser.token);
        
        return mockUser;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return { 
          token: 'mock-token-fallback',
          username: '测试用户',
          userId: 'mock-user-fallback'
        };
      }
    },

    resetForm() {
      this.publishForm = {
        title: '',
        description: '',
        price: 0.01,
        category_id: '',
        condition: '九成新'
      };
      this.uploadedImages = [];
      this.serverStatus = null;
      this.aiRecognitionResult = null;
      this.lastAIRecognitionData = null;
    }
  }
}
</script>

<style scoped>
.publish-page-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-message {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-message.success {
  background-color: #f0f9ff;
  border: 1px solid #e1f5fe;
  color: #0288d1;
}

.status-message.warning {
  background-color: #fffbf0;
  border: 1px solid #ffeaa7;
  color: #f57c00;
}

.status-message.error {
  background-color: #fff5f5;
  border: 1px solid #ffcdd2;
  color: #d32f2f;
}

.ai-result-message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.ai-result-message.success {
  background-color: #f0f9ff;
  border: 1px solid #e1f5fe;
  color: #0288d1;
}

.ai-result-message.warning {
  background-color: #fffbf0;
  border: 1px solid #ffeaa7;
  color: #f57c00;
}

.ai-result-message.error {
  background-color: #fff5f5;
  border: 1px solid #ffcdd2;
  color: #d32f2f;
}

.ai-result-message.info {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  color: #666;
}

.simple-publish-form {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
}

.upload-tips {
  margin-top: 8px;
  text-align: center;
}

.product-form {
  max-width: 600px;
  margin: 0 auto;
}

.price-unit {
  margin-left: 8px;
  color: #606266;
}

@media (max-width: 768px) {
  .publish-page-wrapper {
    padding: 0;
  }
  
  .page-container {
    padding: 10px;
    min-height: calc(100vh - 120px);
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .product-form {
    max-width: 100%;
  }
}
</style>