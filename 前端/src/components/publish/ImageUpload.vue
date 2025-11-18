<template>
  <div class="upload-section">
    <div class="upload-header">
      <div class="upload-title-section">
        <span class="upload-title">商品图片</span>
        <span class="image-count">({{ uploadedImages.length }}/5)</span>
      </div>
      <span class="upload-tip">支持JPG、PNG格式，最多5张，单张不超过5MB</span>
    </div>
    
    <el-upload
      action="#"
      list-type="picture-card"
      :file-list="uploadedImages"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-change="handleChange"
      :auto-upload="false"
      accept="image/jpeg,image/png"
      multiple
      :limit="5"
      :on-exceed="handleExceed"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div class="el-upload__tip">
          点击上传图片，支持JPG、PNG格式
        </div>
      </template>
      
      <template #file="{ file }">
        <div class="image-item">
          <img :src="file.url" class="image-preview" alt="商品图片" />
          <div class="image-actions">
            <el-button 
              circle 
              :icon="Search" 
              @click="$emit('recognize', file)"
              :loading="file.recognizing"
              size="small"
              title="AI识别"
              type="primary"
            />
            <el-button 
              circle 
              :icon="Delete" 
              @click="handleRemove(file)"
              size="small"
              title="删除图片"
              type="danger"
            />
          </div>
          <div class="image-status" v-if="file.recognizing">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>AI识别中...</span>
          </div>
          <div class="image-recognized" v-else-if="file.recognized">
            <el-icon style="color: #67c23a;"><Check /></el-icon>
            <span>已识别</span>
          </div>
        </div>
      </template>
    </el-upload>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      align-center
    >
      <span>确定要删除这张图片吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Plus, Search, Delete, Loading, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ProductService } from '@/services/productService'

export default {
  name: 'ImageUpload',
  components: {
    Plus, Search, Delete, Loading, Check
  },
  props: {
    uploadedImages: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:uploadedImages', 'recognize'],
  data() {
    return {
      deleteDialogVisible: false,
      fileToDelete: null
    }
  },
  methods: {
    beforeUpload(file) {
      const result = ProductService.validateImage(file);
      if (!result.valid) {
        ElMessage.error(result.message);
        return false;
      }
      return true;
    },

    handleChange(file, fileList) {
      this.$emit('update:uploadedImages', fileList);
    },

    handleExceed(files, fileList) {
      ElMessage.warning(`最多只能上传 5 张图片，当前选择了 ${files.length} 张，共 ${files.length + fileList.length} 张`);
    },

    handleRemove(file) {
      this.fileToDelete = file;
      this.deleteDialogVisible = true;
    },

    confirmDelete() {
      if (this.fileToDelete) {
        const newImages = this.uploadedImages.filter(img => img !== this.fileToDelete);
        this.$emit('update:uploadedImages', newImages);
        ElMessage.success('图片删除成功');
        this.deleteDialogVisible = false;
        this.fileToDelete = null;
      }
    }
  }
}
</script>

<style scoped>
.upload-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.upload-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-title {
  font-weight: 600;
  color: #303133;
}

.image-count {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.image-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
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
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
}

.image-status .el-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.image-recognized {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(103, 194, 58, 0.9);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload__tip) {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}
</style>