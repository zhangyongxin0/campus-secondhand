<template>
  <div class="all-recognition">
    <el-card class="recognition-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">AI智能识别</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleBatchRecognize"
            :loading="batchRecognizing"
            :disabled="selectedImages.length === 0"
          >
            {{ batchRecognizing ? '识别中...' : '批量识别' }}
          </el-button>
        </div>
      </template>

      <!-- 图片上传区域 -->
      <div class="upload-section">
        <el-upload
          action="#"
          multiple
          :file-list="selectedImages"
          :before-upload="beforeImageUpload"
          :on-remove="handleRemoveImage"
          :on-change="handleImageChange"
          :auto-upload="false"
          list-type="picture-card"
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          class="image-uploader"
        >
          <el-icon><Plus /></el-icon>
          <div class="upload-text">添加商品图片</div>
        </el-upload>
        
        <div class="upload-tips">
          <el-text type="info">
            支持 JPG、PNG、WEBP、BMP 格式，单张图片不超过 5MB
          </el-text>
        </div>
      </div>

      <!-- 识别结果 -->
      <div v-if="recognitionResults.length > 0" class="results-section">
        <div class="section-title">识别结果</div>
        
        <div class="results-grid">
          <el-card 
            v-for="(result, index) in recognitionResults" 
            :key="index"
            class="result-card"
            :class="`confidence-${result.result.confidenceType}`"
          >
            <div class="result-header">
              <div class="result-image">
                <el-image
                  :src="getImageUrl(result.file)"
                  fit="cover"
                  class="image-preview"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="result-status">
                <el-tag 
                  :type="getStatusColor(result.result.confidenceType)"
                  size="small"
                >
                  {{ getStatusText(result.result.confidenceType) }}
                </el-tag>
              </div>
            </div>
            
            <div class="result-content">
              <div class="result-item">
                <span class="label">商品名称:</span>
                <span class="value">{{ result.result.productName || '未识别' }}</span>
              </div>
              
              <div class="result-item">
                <span class="label">分类:</span>
                <span class="value">{{ result.result.category || '其他' }}</span>
              </div>
              
              <div class="result-item">
                <span class="label">置信度:</span>
                <span class="value">{{ (result.result.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 合并结果 -->
      <div v-if="mergedResult" class="merged-result">
        <div class="section-title">推荐结果</div>
        <el-card class="merged-card">
          <div class="merged-content">
            <div class="merged-item">
              <span class="label">推荐商品名称:</span>
              <span class="value">{{ mergedResult.productName }}</span>
            </div>
            
            <div class="merged-item">
              <span class="label">推荐分类:</span>
              <span class="value">{{ mergedResult.category }}</span>
            </div>
            
            <div class="merged-item">
              <span class="label">综合置信度:</span>
              <span class="value">{{ (mergedResult.confidence * 100).toFixed(1) }}%</span>
            </div>
            
            <div class="merged-item">
              <span class="label">识别统计:</span>
              <span class="value">
                {{ mergedResult.successfulImages }}/{{ mergedResult.totalImages }} 张图片识别成功
              </span>
            </div>
          </div>
          
          <div class="merged-actions">
            <el-button 
              type="primary" 
              @click="applyRecognitionResult"
              :disabled="!mergedResult"
            >
              应用识别结果
            </el-button>
            <el-button 
              @click="clearAll"
            >
              清空结果
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 错误信息 -->
      <div v-if="errorMessage" class="error-section">
        <el-alert
          :title="errorMessage"
          type="error"
          show-icon
          closable
          @close="errorMessage = ''"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { Plus, Picture } from '@element-plus/icons-vue'
import aiService from '@/services/aiService'

export default {
  name: 'AllRecognition',
  components: {
    Plus,
    Picture
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'apply-result'],
  data() {
    return {
      selectedImages: [],
      recognitionResults: [],
      mergedResult: null,
      batchRecognizing: false,
      errorMessage: ''
    }
  },
  methods: {
    // 图片上传前的验证
    beforeImageUpload(file) {
      try {
        aiService.validateImageFile(file)
        return true
      } catch (error) {
        this.$message.error(error.message)
        return false
      }
    },

    // 图片变化处理
    handleImageChange(file, fileList) {
      this.selectedImages = fileList
      this.$emit('update:modelValue', fileList)
    },

    // 移除图片
    handleRemoveImage(file, fileList) {
      this.selectedImages = fileList
      this.$emit('update:modelValue', fileList)
      // 同时移除对应的识别结果
      this.recognitionResults = this.recognitionResults.filter(
        result => result.file.uid !== file.uid
      )
      this.updateMergedResult()
    },

    // 获取图片URL
    getImageUrl(file) {
      return URL.createObjectURL(file.raw || file)
    },

    // 批量识别
    async handleBatchRecognize() {
      if (this.selectedImages.length === 0) {
        this.$message.warning('请先选择图片')
        return
      }

      this.batchRecognizing = true
      this.errorMessage = ''

      try {
        // 验证所有图片
        for (const file of this.selectedImages) {
          aiService.validateImageFile(file.raw || file)
        }

        // 执行批量识别
        const results = await aiService.recognizeMultipleProducts(
          this.selectedImages.map(file => file.raw || file)
        )

        this.recognitionResults = results.filter(result => result.success)

        // 更新合并结果
        this.updateMergedResult()

        if (this.recognitionResults.length === 0) {
          this.$message.warning('所有图片识别都失败了，请尝试其他图片')
        } else {
          this.$message.success(`成功识别 ${this.recognitionResults.length} 张图片`)
        }

      } catch (error) {
        console.error('批量识别失败:', error)
        this.errorMessage = error.message || '识别失败，请稍后重试'
        this.$message.error(this.errorMessage)
      } finally {
        this.batchRecognizing = false
      }
    },

    // 更新合并结果
    updateMergedResult() {
      if (this.recognitionResults.length === 0) {
        this.mergedResult = null
        return
      }

      try {
        this.mergedResult = aiService.mergeRecognitionResults(this.recognitionResults)
      } catch (error) {
        console.error('合并识别结果失败:', error)
        this.mergedResult = null
      }
    },

    // 获取状态文本
    getStatusText(confidenceType) {
      return aiService.getRecognitionStatusText(confidenceType)
    },

    // 获取状态颜色
    getStatusColor(confidenceType) {
      return aiService.getRecognitionStatusColor(confidenceType)
    },

    // 应用识别结果
    applyRecognitionResult() {
      if (!this.mergedResult) {
        this.$message.warning('没有可应用的识别结果')
        return
      }

      this.$emit('apply-result', {
        title: this.mergedResult.productName,
        category: this.mergedResult