<template>
  <el-form 
    :model="formData" 
    :rules="formRules" 
    ref="formRef"
    label-width="100px"
    class="product-form"
  >
    <el-form-item label="商品标题" prop="title">
      <el-input 
        v-model="formData.title" 
        placeholder="请输入商品标题，AI可自动识别生成"
        maxlength="100"
        show-word-limit
      >
        <template #append>
          <el-button 
            text 
            @click="generateTitleWithAI"
            :loading="generatingTitle"
            :disabled="!aiTags.length"
          >
            <el-icon><MagicStick /></el-icon>
            AI生成
          </el-button>
        </template>
      </el-input>
    </el-form-item>
    
    <el-form-item label="商品描述" prop="description">
      <el-input 
        v-model="formData.description" 
        type="textarea"
        :rows="4"
        placeholder="请输入商品详细描述，AI可自动生成"
        maxlength="500"
        show-word-limit
      />
      <div class="description-actions">
        <el-button 
          @click="generateDescriptionWithAI"
          :loading="generatingDescription"
          :disabled="!aiTags.length && !formData.title"
          size="small"
          type="primary"
          text
        >
          <el-icon><MagicStick /></el-icon>
          AI生成描述
        </el-button>
        <el-button 
          @click="enhanceDescriptionWithAI"
          :loading="enhancingDescription"
          :disabled="!formData.description"
          size="small"
          text
        >
          <el-icon><Edit /></el-icon>
          AI优化描述
        </el-button>
      </div>
    </el-form-item>
    
    <el-form-item label="价格" prop="price">
      <el-input-number 
        v-model="formData.price" 
        :min="0.01" 
        :max="99999" 
        :precision="2"
        placeholder="请输入价格"
        style="width: 200px;"
      >
        <template #append>元</template>
      </el-input-number>
      <span class="price-tip">价格范围: 0.01 - 99999 元</span>
    </el-form-item>
    
    <el-form-item label="商品分类" prop="category_id">
      <el-select 
        v-model="formData.category_id" 
        placeholder="请选择分类，AI可自动推荐" 
        style="width: 100%;"
        clearable
        filterable
      >
        <!-- AI推荐分类 -->
        <el-option-group v-if="aiRecommendedCategories.length > 0" label="AI推荐分类">
          <el-option 
            v-for="category in aiRecommendedCategories"
            :key="category.name"
            :label="`${category.name} (AI推荐 ${(category.confidence * 100).toFixed(0)}%)`"
            :value="getCategoryIdByName(category.name)"
            style="color: #67c23a; font-weight: bold;"
          />
        </el-option-group>
        
        <!-- 常规分类 -->
        <el-option-group label="所有分类">
          <el-option 
            v-for="category in categories" 
            :key="category.category_id" 
            :label="category.category_name" 
            :value="category.category_id"
          ></el-option>
        </el-option-group>
      </el-select>
    </el-form-item>
    
    <el-form-item label="商品成色" prop="condition">
      <el-select v-model="formData.condition" placeholder="请选择成色" style="width: 100%;">
        <el-option 
          v-for="option in conditionOptions" 
          :key="option.value"
          :label="option.label" 
          :value="option.value"
        ></el-option>
      </el-select>
    </el-form-item>
    
    <el-form-item>
      <el-button 
        type="primary" 
        @click="handleSubmit" 
        style="width: 100%;" 
        size="large"
        :loading="submitting"
        :disabled="submitDisabled"
      >
        {{ submitting ? '发布中...' : '发布商品' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { MagicStick, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { FORM_RULES, CATEGORIES, CONDITION_OPTIONS } from '@/utils/constants'
import aiService from '@/services/aiService'

export default {
  name: 'ProductForm',
  components: {
    MagicStick,
    Edit
  },
  props: {
    formData: {
      type: Object,
      required: true
    },
    aiTags: {
      type: Array,
      default: () => []
    },
    aiRecommendedCategories: {
      type: Array,
      default: () => []
    },
    submitting: {
      type: Boolean,
      default: false
    },
    submitDisabled: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:formData',
    'submit',
    'generate-title',
    'generate-description'
  ],
  data() {
    return {
      formRules: FORM_RULES,
      categories: CATEGORIES,
      conditionOptions: CONDITION_OPTIONS,
      generatingTitle: false,
      generatingDescription: false,
      enhancingDescription: false
    }
  },
  methods: {
    async generateTitleWithAI() {
      if (this.aiTags.length === 0 && !this.formData.title) {
        ElMessage.warning('请先使用AI识别图片获取标签或手动输入标题');
        return;
      }

      this.generatingTitle = true;
      try {
        // 使用AI服务生成标题
        const tags = this.aiTags.length ? this.aiTags : [this.formData.title];
        const title = aiService.generateTitle(tags, this.formData.condition);
        
        this.$emit('update:formData', {
          ...this.formData,
          title
        });
        
        ElMessage.success('AI标题生成完成');
      } catch (error) {
        console.error('生成标题失败:', error);
        ElMessage.error('生成失败，请重试');
      } finally {
        this.generatingTitle = false;
      }
    },

    async generateDescriptionWithAI() {
      if (this.aiTags.length === 0 && !this.formData.title) {
        ElMessage.warning('请先使用AI识别图片获取标签或手动输入标题');
        return;
      }

      this.generatingDescription = true;
      try {
        // 使用AI服务生成描述
        const tags = this.aiTags.length ? this.aiTags : [this.formData.title];
        const description = aiService.generateDescription(
          tags, 
          this.formData.condition, 
          this.formData.price
        );
        
        this.$emit('update:formData', {
          ...this.formData,
          description
        });
        
        ElMessage.success('AI描述生成完成');
      } catch (error) {
        console.error('生成描述失败:', error);
        ElMessage.error('生成失败，请重试');
      } finally {
        this.generatingDescription = false;
      }
    },

    async enhanceDescriptionWithAI() {
      if (!this.formData.description) {
        ElMessage.warning('请先输入商品描述');
        return;
      }

      this.enhancingDescription = true;
      try {
        // 模拟AI优化描述
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const enhancedDescription = aiService.enhanceDescription(
          this.formData.description,
          this.aiTags.length ? this.aiTags : [],
          this.formData.condition
        );
        
        this.$emit('update:formData', {
          ...this.formData,
          description: enhancedDescription
        });
        
        ElMessage.success('AI优化完成');
      } catch (error) {
        console.error('优化描述失败:', error);
        ElMessage.error('优化失败，请重试');
      } finally {
        this.enhancingDescription = false;
      }
    },

    getCategoryIdByName(categoryName) {
      const category = this.categories.find(cat => cat.category_name === categoryName);
      return category ? category.category_id : null;
    },

    handleSubmit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$emit('submit', this.formData);
        } else {
          ElMessage.error('请完善表单信息');
        }
      });
    },

    // 提供给父组件调用的方法
    validateForm() {
      return this.$refs.formRef.validate();
    },

    resetForm() {
      this.$refs.formRef.resetFields();
    }
  }
}
</script>

<style scoped>
.product-form {
  margin-top: 20px;
}

.price-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.description-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-form-item__label) {
    text-align: left;
  }
  
  .description-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>