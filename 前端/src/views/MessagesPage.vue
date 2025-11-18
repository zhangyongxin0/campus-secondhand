<template>
  <div class="messages-page-wrapper">
    <div class="page-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>消息中心</span>
            <div class="header-actions">
              <el-button type="primary" @click="showNewMessageDialog = true">
                <el-icon><Plus /></el-icon>
                新消息
              </el-button>
              <el-badge :value="unreadCount" v-if="unreadCount > 0" class="unread-badge">
                <el-button @click="toggleViewMode">
                  {{ viewMode === 'conversations' ? '查看消息列表' : '查看对话' }}
                </el-button>
              </el-badge>
            </div>
          </div>
        </template>

        <!-- 对话视图 -->
        <div v-if="viewMode === 'conversations'" class="messages-content">
          <!-- 消息列表 -->
          <div class="conversations-list">
            <div 
              v-for="conversation in conversations" 
              :key="conversation.id"
              class="conversation-item"
              :class="{ active: activeConversation?.id === conversation.id }"
              @click="selectConversation(conversation)"
            >
              <div class="conversation-avatar">
                <el-avatar :size="40" :src="conversation.avatar">
                  {{ conversation.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="conversation-info">
                <div class="conversation-header">
                  <span class="conversation-name">{{ conversation.name }}</span>
                  <span class="conversation-time">{{ formatTime(conversation.lastMessageTime) }}</span>
                </div>
                <div class="conversation-preview">
                  {{ conversation.lastMessage }}
                </div>
                <div class="conversation-meta">
                  <span class="product-info" v-if="conversation.productTitle">
                    相关商品: {{ conversation.productTitle }}
                  </span>
                  <el-badge v-if="conversation.unreadCount > 0" :value="conversation.unreadCount" class="unread-badge" />
                </div>
              </div>
            </div>
          </div>

          <!-- 消息对话框 -->
          <div class="message-dialog" v-if="activeConversation">
            <div class="dialog-header">
              <h3>{{ activeConversation.name }}</h3>
              <div class="header-actions">
                <el-button type="text" @click="showUserInfo(activeConversation)">
                  <el-icon><InfoFilled /></el-icon>
                  用户信息
                </el-button>
                <el-button type="text" @click="clearConversation(activeConversation.id)">
                  <el-icon><Delete /></el-icon>
                  清除记录
                </el-button>
              </div>
            </div>

            <div class="messages-list" ref="messagesList">
              <div 
                v-for="message in activeConversation.messages" 
                :key="message.id"
                class="message-item"
                :class="{ 'own-message': message.isOwn }"
              >
                <div class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatMessageTime(message.time) }}</div>
                </div>
              </div>
            </div>

            <div class="message-input">
              <el-input
                v-model="newMessage"
                type="textarea"
                :rows="3"
                placeholder="输入消息..."
                @keyup.enter="sendMessage"
              />
              <div class="input-actions">
                <el-button type="primary" @click="sendMessage" :disabled="!newMessage.trim()">
                  发送
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="选择对话开始聊天" />
          </div>
        </div>

        <!-- 消息列表视图 -->
        <div v-else class="messages-list-view">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="6" animated />
          </div>

          <!-- 消息列表 -->
          <div v-else-if="messages.length > 0" class="messages-list">
            <el-card 
              v-for="message in messages" 
              :key="message.id"
              class="message-item"
              :class="{ 'unread': !message.read }"
              shadow="hover"
            >
              <div class="message-content">
                <div class="message-header">
                  <div class="message-info">
                    <span class="message-type">
                      <el-tag v-if="message.sender_id === currentUserId" type="success" size="small">
                        我发送的
                      </el-tag>
                      <el-tag v-else type="primary" size="small">
                        收到的
                      </el-tag>
                    </span>
                    <span class="message-party">
                      {{ message.sender_id === currentUserId ? '发给' : '来自' }} 
                      <strong>{{ message.sender_id === currentUserId ? message.receiver_name : message.sender_name }}</strong>
                    </span>
                    <span class="message-time">{{ formatTime(message.created_time) }}</span>
                  </div>
                  <div class="message-status">
                    <el-tag v-if="!message.read && message.receiver_id === currentUserId" type="warning" size="small">
                      未读
                    </el-tag>
                  </div>
                </div>
                
                <div class="message-body">
                  <p class="message-text">{{ message.content }}</p>
                  <div class="message-product" v-if="message.product_id">
                    <el-link 
                      type="primary" 
                      :underline="false" 
                      @click="goToProductDetail(message.product_id)"
                    >
                      相关商品: {{ getProductTitle(message.product_id) }}
                    </el-link>
                  </div>
                </div>
                
                <div class="message-actions" v-if="!message.read && message.receiver_id === currentUserId">
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="markAsRead(message.id)"
                  >
                    标记为已读
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="暂无消息">
              <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
            </el-empty>
          </div>
        </div>
      </el-card>

      <!-- 新消息对话框 -->
      <el-dialog
        v-model="showNewMessageDialog"
        title="新消息"
        width="500px"
      >
        <div class="new-message-dialog">
          <el-form :model="newMessageForm" label-width="80px">
            <el-form-item label="收件人">
              <el-select
                v-model="newMessageForm.recipientId"
                placeholder="选择收件人"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="user in potentialRecipients"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="相关商品">
              <el-select
                v-model="newMessageForm.productId"
                placeholder="选择商品（可选）"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="product in userProducts"
                  :key="product.id"
                  :label="product.title"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input
                v-model="newMessageForm.content"
                type="textarea"
                :rows="4"
                placeholder="输入消息内容..."
              />
            </el-form-item>
          </el-form>
          <div class="dialog-actions">
            <el-button @click="showNewMessageDialog = false">取消</el-button>
            <el-button type="primary" @click="createNewConversation">发送</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { Plus, InfoFilled, Delete } from '@element-plus/icons-vue'

// 模拟数据服务 - 如果还没有这个文件，可以先在组件内定义
const mockDataService = {
  getUserConversations(userId) {
    return [
      {
        id: 'conv-1',
        name: '张三',
        avatar: '',
        lastMessage: '你好，我对你的商品很感兴趣',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        productTitle: '二手iPhone 13',
        unreadCount: 2,
        messages: [
          {
            id: 'msg-1-1',
            content: '你好，我对你的商品很感兴趣',
            time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            isOwn: false
          },
          {
            id: 'msg-1-2',
            content: '你好，有什么问题吗？',
            time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            isOwn: true
          }
        ]
      },
      {
        id: 'conv-2',
        name: '李四',
        avatar: '',
        lastMessage: '价格可以再便宜点吗？',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        productTitle: 'MacBook Pro',
        unreadCount: 0,
        messages: [
          {
            id: 'msg-2-1',
            content: '价格可以再便宜点吗？',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            isOwn: false
          },
          {
            id: 'msg-2-2',
            content: '最低价了，已经很优惠了',
            time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            isOwn: true
          }
        ]
      }
    ]
  },

  markConversationAsRead(conversationId) {
    console.log(`对话 ${conversationId} 标记为已读`)
    return true
  },

  clearConversation(conversationId) {
    console.log(`清除对话 ${conversationId} 的记录`)
    return true
  },

  getPotentialRecipients() {
    return [
      { id: 'user-1', name: '张三' },
      { id: 'user-2', name: '李四' },
      { id: 'user-3', name: '王五' },
      { id: 'user-4', name: '赵六' }
    ]
  },

  getUserProducts(userId) {
    return [
      { id: 'prod-1', title: '二手iPhone 13' },
      { id: 'prod-2', title: 'MacBook Pro' },
      { id: 'prod-3', title: '佳能相机' }
    ]
  },

  createConversation(senderId, recipientId, recipientName, content, productTitle) {
    const conversationId = `conv-${Date.now()}`
    return {
      id: conversationId,
      name: recipientName,
      avatar: '',
      lastMessage: content,
      lastMessageTime: new Date().toISOString(),
      productTitle: productTitle,
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: content,
          time: new Date().toISOString(),
          isOwn: true
        }
      ]
    }
  },

  getUserMessages(userId) {
    return [
      {
        id: 'msg-1',
        sender_id: 'user-2',
        sender_name: '张三',
        receiver_id: userId,
        receiver_name: '当前用户',
        content: '你好，我对你的商品很感兴趣',
        created_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        product_id: 'prod-1'
      },
      {
        id: 'msg-2',
        sender_id: userId,
        sender_name: '当前用户',
        receiver_id: 'user-2',
        receiver_name: '张三',
        content: '你好，有什么问题吗？',
        created_time: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        read: true,
        product_id: 'prod-1'
      }
    ]
  },

  getUnreadMessageCount(userId) {
    const messages = this.getUserMessages(userId)
    return messages.filter(msg => !msg.read && msg.receiver_id === userId).length
  },

  markMessageAsRead(messageId) {
    console.log(`消息 ${messageId} 标记为已读`)
    return true
  },

  getProductById(productId) {
    const products = {
      'prod-1': { id: 'prod-1', title: '二手iPhone 13' },
      'prod-2': { id: 'prod-2', title: 'MacBook Pro' },
      'prod-3': { id: 'prod-3', title: '佳能相机' }
    }
    return products[productId] || null
  }
}

export default {
  name: 'MessagesPage',
  components: {
    Plus,
    InfoFilled,
    Delete
  },
  data() {
    return {
      conversations: [],
      activeConversation: null,
      newMessage: '',
      showNewMessageDialog: false,
      newMessageForm: {
        recipientId: '',
        productId: '',
        content: ''
      },
      potentialRecipients: [],
      userProducts: [],
      viewMode: 'conversations', // 'conversations' or 'list'
      messages: [],
      loading: false,
      unreadCount: 0
    }
  },
  computed: {
    currentUserId() {
      return this.getCurrentUserId()
    }
  },
  methods: {
    loadConversations() {
      const userId = this.getCurrentUserId()
      this.conversations = mockDataService.getUserConversations(userId)
    },

    async loadMessages() {
      this.loading = true
      try {
        const userId = this.getCurrentUserId()
        if (!userId) {
          this.$message.warning('请先登录')
          this.$router.push('/login')
          return
        }

        this.messages = mockDataService.getUserMessages(userId)
        this.unreadCount = mockDataService.getUnreadMessageCount(userId)
        console.log('📨 加载消息列表:', this.messages)
      } catch (error) {
        console.error('❌ 加载消息列表失败:', error)
        this.$message.error('加载消息列表失败')
      } finally {
        this.loading = false
      }
    },

    selectConversation(conversation) {
      this.activeConversation = conversation
      // 标记为已读
      mockDataService.markConversationAsRead(conversation.id)
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    sendMessage() {
      if (!this.newMessage.trim() || !this.activeConversation) return

      const message = {
        id: Date.now(),
        content: this.newMessage.trim(),
        time: new Date().toISOString(),
        isOwn: true
      }

      // 添加到当前对话
      this.activeConversation.messages.push(message)
      this.activeConversation.lastMessage = message.content
      this.activeConversation.lastMessageTime = message.time

      // 更新未读计数
      this.updateUnreadCount()

      // 模拟对方回复（实际项目中应该是真实的）
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          content: '收到您的消息，我会尽快回复！',
          time: new Date().toISOString(),
          isOwn: false
        }
        this.activeConversation.messages.push(reply)
        this.activeConversation.lastMessage = reply.content
        this.activeConversation.lastMessageTime = reply.time
        this.scrollToBottom()
      }, 1000)

      this.newMessage = ''
      this.scrollToBottom()
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesList
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    showUserInfo(user) {
      this.$message.info(`用户: ${user.name}`)
    },

    clearConversation(conversationId) {
      this.$confirm('确定要清除聊天记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        mockDataService.clearConversation(conversationId)
        this.loadConversations()
        this.activeConversation = null
        this.$message.success('聊天记录已清除')
      })
    },

    createNewConversation() {
      if (!this.newMessageForm.recipientId || !this.newMessageForm.content.trim()) {
        this.$message.warning('请填写收件人和消息内容')
        return
      }

      const recipient = this.potentialRecipients.find(u => u.id === this.newMessageForm.recipientId)
      const product = this.userProducts.find(p => p.id === this.newMessageForm.productId)

      const newConversation = mockDataService.createConversation(
        this.getCurrentUserId(),
        this.newMessageForm.recipientId,
        recipient.name,
        this.newMessageForm.content,
        product ? product.title : null
      )

      if (newConversation) {
        this.conversations.unshift(newConversation)
        this.selectConversation(newConversation)
        this.showNewMessageDialog = false
        this.newMessageForm = {
          recipientId: '',
          productId: '',
          content: ''
        }
        this.$message.success('消息发送成功')
      }
    },

    async markAsRead(messageId) {
      try {
        const success = mockDataService.markMessageAsRead(messageId)
        if (success) {
          this.$message.success('标记为已读')
          await this.loadMessages() // 重新加载消息列表
        } else {
          this.$message.error('操作失败')
        }
      } catch (error) {
        console.error('标记已读失败:', error)
        this.$message.error('操作失败')
      }
    },

    goToProductDetail(productId) {
      if (productId) {
        this.$router.push(`/product/${productId}`)
      }
    },

    getProductTitle(productId) {
      const product = mockDataService.getProductById(productId)
      return product ? product.title : '商品已删除'
    },

    formatTime(timeString) {
      if (!timeString) return ''
      try {
        const date = new Date(timeString)
        return date.toLocaleString('zh-CN')
      } catch (error) {
        return ''
      }
    },

    formatMessageTime(timeString) {
      return new Date(timeString).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getCurrentUserId() {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          return userInfo.student_id || userInfo.id || 'mock-user-1'
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
      return 'mock-user-1'
    },

    toggleViewMode() {
      this.viewMode = this.viewMode === 'conversations' ? 'list' : 'conversations'
      if (this.viewMode === 'list') {
        this.loadMessages()
      } else {
        this.loadConversations()
      }
    },

    updateUnreadCount() {
      const userId = this.getCurrentUserId()
      this.unreadCount = mockDataService.getUnreadMessageCount(userId)
    }
  },
  mounted() {
    this.loadConversations()
    // 加载潜在收件人（实际项目中应该是从API获取）
    this.potentialRecipients = mockDataService.getPotentialRecipients()
    this.userProducts = mockDataService.getUserProducts(this.getCurrentUserId())
    this.updateUnreadCount()
  }
}
</script>

<style scoped>
.messages-page-wrapper {
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
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.unread-badge {
  margin-left: 10px;
}

.messages-content {
  display: flex;
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.conversations-list {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.conversation-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  gap: 12px;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #ecf5ff;
  border-right: 3px solid #409eff;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.conversation-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.conversation-time {
  font-size: 12px;
  color: #909399;
}

.conversation-preview {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.message-dialog {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.messages-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

.message-item {
  margin-bottom: 15px;
  display: flex;
}

.message-item.own-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.own-message .message-content {
  background-color: #409eff;
  color: white;
}

.message-text {
  margin-bottom: 5px;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-input {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 消息列表视图样式 */
.messages-list-view {
  min-height: 500px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.message-item.unread {
  border-left-color: #409eff;
  background-color: #f0f9ff;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-content {
  padding: 8px 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-type {
  margin-bottom: 4px;
}

.message-party {
  font-size: 14px;
  color: #606266;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-status {
  flex-shrink: 0;
}

.message-body {
  margin-bottom: 12px;
}

.message-text {
  line-height: 1.5;
  color: #303133;
  margin-bottom: 8px;
}

.message-product {
  font-size: 14px;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}

.loading-state {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
}

/* 新消息对话框样式 */
.new-message-dialog .dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .messages-page-wrapper {
    padding: 0;
  }
  
  .page-container {
    padding: 10px;
    min-height: calc(100vh - 120px);
  }
  
  .messages-content {
    flex-direction: column;
    height: auto;
  }
  
  .conversations-list {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .message-dialog {
    height: 400px;
  }
  
  .message-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .message-status {
    align-self: flex-start;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>