<template>
  <div class="image-upload">
    <el-upload
      action="#"
      list-type="picture-card"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :auto-upload="false"
      accept="image/*"
      multiple
      :limit="5"
    >
      <el-icon><Plus /></el-icon>
      
      <template #file="{ file }">
        <div class="image-item">
          <img :src="file.url" class="image-preview" />
          <div class="image-actions">
            <el-button 
              circle 
              :icon="Search" 
              @click="handleRecognize(file)"
              :loading="file.recognizing"
              title="AI识别"
            />
            <el-button 
              circle 
              :icon="Delete" 
              @click="handleRemove(file)"
              title="删除"
            />
          </div>
        </div>
      </template>
    </el-upload>

    <!-- AI识别结果展示 -->
    <div v-if="recognitionResults.length > 0" class="recognition-results">
      <h4>AI识别结果</h4>
      <el-alert
        v-for="(result, index) in recognitionResults"
        :key="index"
        :title="`推荐分类: ${result.category} (置信度: ${(result.confidence * 100).toFixed(1)}%)`"
        :description="`识别标签: ${result.tags.join(', ')}`"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 10px;"
      />
    </div>
  </div>
</template>

<script>
import { Plus, Search, Delete } from '@element-plus/icons-vue'
import aiService from '@/services/aiService'

export default {
  name: 'ImageUpload',
  components: {
    Plus, Search, Delete
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileList: [],
      recognitionResults: []
    }
  },
  methods: {
    beforeUpload(file) {
      // 验证图片格式和大小
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    },

    handleChange(file, fileList) {
      this.fileList = fileList
      this.emitUpdate()
    },

    handleRemove(file) {
      const index = this.fileList.indexOf(file)
      if (index > -1) {
        this.fileList.splice(index, 1)
      }
      this.emitUpdate()
    },

    async handleRecognize(file) {
      file.recognizing = true
      
      try {
        // 将图片转换为base64
        const base64 = await this.fileToBase64(file.raw)
        
        // 调用AI识别服务
        const result = await aiService.recognizeImage(base64.split(',')[1]) // 移除data:image前缀
        
        if (result.success) {
          this.recognitionResults.push(result)
          this.$emit('recognition-result', result)
          this.$message.success(`识别成功: ${result.category}`)
        } else {
          this.$message.warning(result.message)
        }
      } catch (error) {
        console.error('AI识别失败:', error)
        this.$message.error('识别失败: ' + error.message)
      } finally {
        file.recognizing = false
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },

    emitUpdate() {
      this.$emit('update:modelValue', this.fileList.map(file => file.raw))
    }
  }
}
</script>

<style scoped>
.image-item {
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.recognition-results {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>