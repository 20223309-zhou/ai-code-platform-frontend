<template>
  <div id="appChatPage">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <div class="header-left">
        <h1 class="app-name">{{ appInfo?.appName || '网站生成器' }}</h1>
        <a-tag v-if="appInfo?.codeGenType" color="blue" class="code-gen-type-tag">
          {{ formatCodeGenType(appInfo.codeGenType) }}
        </a-tag>
      </div>
      <div class="header-right">
        <a-button type="default" @click="showAppDetail">
          <template #icon>
            <InfoCircleOutlined />
          </template>
          应用详情
        </a-button>
        <a-button
            type="primary"
            ghost
            @click="downloadCode"
            :loading="downloading"
            :disabled="!isOwner"
        >
          <template #icon>
            <DownloadOutlined />
          </template>
          下载代码
        </a-button>
        <a-button type="primary" @click="deployApp" :loading="deploying">
          <template #icon>
            <CloudUploadOutlined />
          </template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧对话区域 -->
      <div class="chat-section">
        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 加载更多按钮 -->
          <div v-if="hasMoreHistory" class="load-more-container">
            <a-button type="link" @click="loadMoreHistory" :loading="loadingHistory" size="small">
              加载更多历史消息
            </a-button>
          </div>
          <div v-for="(message, index) in messages" :key="index" class="message-item">
            <div v-if="message.type === 'user'" class="user-message">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-avatar">
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
              </div>
            </div>
            <div v-else class="ai-message">
              <div class="message-avatar">
                <a-avatar :src="aiAvatar" />
              </div>
              <div class="message-content">
                <div v-if="message.thinking" class="thinking-bubble">
                  <div class="thinking-header" @click="message.thinkingExpanded = !message.thinkingExpanded">
                    <svg t="1778761273516" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5798" width="16" height="16"><path d="M592.8448 426.5984l47.104-47.104c8.7552 8.8576 17.408 17.7152 25.7536 26.624l-48.2816 45.7216a1274.88 1274.88 0 0 0-24.576-25.2416zM847.36 857.7024c-25.1904 25.2416-60.5696 31.232-95.232 28.0064-34.8672-3.2768-74.24-16.384-115.2-36.0448-82.2272-39.5776-177.6128-109.4144-267.7248-199.5264a1370.0096 1370.0096 0 0 1-16.2304-16.5376l24.0128-23.0912 23.8592-23.1424c5.12 5.2736 10.24 10.4448 15.4624 15.6672 86.272 86.272 175.616 151.0912 249.4464 186.624 37.0688 17.8688 68.5056 27.4944 92.672 29.7984 24.3712 2.304 36.2496-3.2256 41.8816-8.8576 7.168-7.168 13.824-24.832 5.4784-62.4128-7.9872-35.9936-28.3136-81.92-60.4672-133.4272l56.4224-35.2768c34.4064 55.04 58.7776 108.1344 69.0176 154.2144 9.9328 44.544 8.4992 92.16-23.3472 124.0064zM208.8448 219.0336c-7.5264 7.5264-14.336 26.5728-4.4544 66.9696 9.472 38.5536 32.256 87.5008 67.7376 141.9264l-27.904 18.1248-27.8528 18.176C178.688 406.3744 151.6544 350.3104 139.776 301.824c-11.4688-46.592-11.1104-96.7168 22.016-129.8432 25.2416-25.2416 60.6208-31.232 95.232-28.0064 34.9184 3.2768 74.3424 16.384 115.2512 36.0448 82.2272 39.5776 177.5104 109.4144 267.6224 199.5264l-47.104 47.104c-86.2208-86.272-175.5648-151.04-249.344-186.624-37.12-17.8176-68.5568-27.4944-92.672-29.7984-24.4224-2.304-36.352 3.1744-41.9328 8.8064z" p-id="5799" fill="#cdcdcd"></path><path d="M416.3584 426.5984l-47.104-47.104c8.8576-8.8064 17.7152-17.408 26.624-25.8048l45.7728 48.3328c-8.448 7.9872-16.896 16.2304-25.2928 24.576zM847.5648 172.032c25.2416 25.1904 31.232 60.5696 28.0064 95.232-3.328 34.8672-16.384 74.24-36.096 115.2-39.5776 82.2272-109.4144 177.6128-199.5264 267.7248-5.4784 5.4784-10.9568 10.9056-16.4864 16.2304l-23.1424-24.0128-23.0912-23.8592 15.6672-15.4624c86.2208-86.272 151.04-175.616 186.624-249.4464 17.8176-37.0688 27.4944-68.4544 29.7984-92.672 2.2528-24.3712-3.2256-36.2496-8.8576-41.8816-7.168-7.168-24.8832-13.824-62.4128-5.4784-35.9936 7.9872-81.92 28.3136-133.4784 60.4672l-35.2256-56.4224c54.9888-34.4064 108.0832-58.7776 154.2144-69.0176 44.544-9.9328 92.16-8.4992 124.0064 23.3472z" p-id="5800" fill="#cdcdcd"></path><path d="M208.8448 810.5984c7.5264 7.5264 26.5728 14.336 66.9696 4.4544 38.5536-9.4208 87.5008-32.256 141.9264-67.7376l18.1248 27.904 18.176 27.8528c-57.856 37.7344-113.92 64.7168-162.4064 76.6464-46.592 11.4176-96.7168 11.1104-129.8432-22.016-25.2416-25.2416-31.2832-60.672-28.0064-95.232 3.2768-34.9696 16.384-74.3424 36.0448-115.3024 39.5776-82.176 109.4144-177.5104 199.5264-267.6224l47.0528 47.104c-86.272 86.2208-151.04 175.616-186.5728 249.3952-17.8176 37.0688-27.5456 68.5056-29.7984 92.672-2.304 24.3712 3.1744 36.3008 8.8064 41.8816zM554.0864 554.752A60.928 60.928 0 1 1 467.968 468.5312a60.928 60.928 0 0 1 86.1696 86.2208z" p-id="5801" fill="#cdcdcd"></path><path d="M522.1888 522.752a15.8208 15.8208 0 1 0-22.3744 0l-31.9488 32-4.096-4.608a60.928 60.928 0 1 1 90.368 4.608l-4.6592 4.1984a60.9792 60.9792 0 0 1-81.6128-4.1984l31.9488-31.9488c6.144 6.144 16.1792 6.144 22.3744 0z" p-id="5802" fill="#cdcdcd"></path></svg>
                    <span>深度思考</span>
                    <span class="thinking-toggle">{{ message.thinkingExpanded ? '收起 ▲' : '展开 ▼' }}</span>
                  </div>
                  <div v-if="message.thinkingExpanded" class="thinking-body">
                    <MarkdownRenderer :content="message.thinking" />
                  </div>
                </div>
                <MarkdownRenderer v-if="message.content" :content="message.content" />
                <div v-if="message.loading" class="loading-indicator">
                  <a-spin size="small" />
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 选中元素信息展示 -->
        <a-alert
            v-if="selectedElementInfo"
            class="selected-element-alert"
            type="info"
            closable
            @close="clearSelectedElement"
        >
          <template #message>
            <div class="selected-element-info">
              <div class="element-header">
                <span class="element-tag">
                  选中元素：{{ selectedElementInfo.tagName.toLowerCase() }}
                </span>
                <span v-if="selectedElementInfo.id" class="element-id">
                  #{{ selectedElementInfo.id }}
                </span>
                <span v-if="selectedElementInfo.className" class="element-class">
                  .{{ selectedElementInfo.className.split(' ').join('.') }}
                </span>
              </div>
              <div class="element-details">
                <div v-if="selectedElementInfo.textContent" class="element-item">
                  内容: {{ selectedElementInfo.textContent.substring(0, 50) }}
                  {{ selectedElementInfo.textContent.length > 50 ? '...' : '' }}
                </div>
                <div v-if="selectedElementInfo.pagePath" class="element-item">
                  页面路径: {{ selectedElementInfo.pagePath }}
                </div>
                <div class="element-item">
                  选择器:
                  <code class="element-selector-code">{{ selectedElementInfo.selector }}</code>
                </div>
              </div>
            </div>
          </template>
        </a-alert>

        <!-- 用户消息输入框 -->
        <div class="input-container">
          <div class="upload-preview" v-if="uploadedFiles.length > 0">
            <span v-for="(file, index) in uploadedFiles" :key="index" class="upload-file">
              <span class="upload-file-text">{{ file.name }}</span>
              <CloseOutlined class="upload-file-close" @click="removeFile(index)" />
            </span>
          </div>
          <div class="input-wrapper">
            <a-tooltip v-if="!isOwner" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea
                  v-model:value="userInput"
                  :placeholder="getInputPlaceholder()"
                  :rows="4"
                  :maxlength="1000"
                  @keydown.enter.prevent="sendMessage"
                  :disabled="isGenerating || !isOwner"
              />
            </a-tooltip>
            <a-textarea
                v-else
                v-model:value="userInput"
                :placeholder="getInputPlaceholder()"
                :rows="4"
                :maxlength="1000"
                @keydown.enter.prevent="sendMessage"
                :disabled="isGenerating"
            />
            <div class="input-actions">
              <label class="upload-label" title="上传图片或文本文件">
                <CloudUploadOutlined style="font-size: 16px;" />
                <span style="margin-left: 4px;">上传</span>
                <input
                    type="file"
                    accept="image/*,.txt"
                    multiple
                    style="display: none"
                    @change="onFileChange"
                />
              </label>
              <div class="input-actions-center">
                <a-tooltip title="RAG:开启后 AI 会从已部署的模板库中检索风格相似的代码块作为参考，应用生成的成功率会更高">
                  <label class="glass-toggle" :class="{ active: useRag }">
                    <input type="checkbox" v-model="useRag" style="display: none" />
                    <span class="glass-toggle-track">
                      <span class="glass-toggle-knob">R</span>
                    </span>
                  </label>
                </a-tooltip>
              </div>
              <div class="input-actions-end">
              <a-button
                  v-if="isGenerating"
                  class="stop-button"
                  danger
                  @click="stopGeneration"
              >
                <template #icon>
                  <CloseOutlined />
                </template>
                停止
              </a-button>
              <a-button
                  v-else
                  class="send-button"
                  type="primary"
                  @click="sendMessage"
                  :disabled="!isOwner"
              >
                <template #icon>
                  <SendOutlined />
                </template>
              </a-button>
            </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧网页展示区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>生成后的网页展示</h3>
          <div class="preview-actions">
            <a-button
                v-if="isOwner && previewUrl"
                type="link"
                :danger="isEditMode"
                @click="toggleEditMode"
                :class="{ 'edit-mode-active': isEditMode }"
                style="padding: 0; height: auto; margin-right: 12px"
            >
              <template #icon>
                <EditOutlined />
              </template>
              {{ isEditMode ? '退出编辑' : '编辑模式' }}
            </a-button>
            <a-button v-if="previewUrl" type="link" @click="openInNewTab">
              <template #icon>
                <ExportOutlined />
              </template>
              新窗口打开
            </a-button>
          </div>
        </div>
        <div class="preview-content">
          <div v-if="!previewUrl && !isGenerating" class="preview-placeholder">
            <div class="placeholder-icon">🌐</div>
            <p>网站文件生成完成后将在这里展示</p>
          </div>
          <div v-else-if="isGenerating" class="preview-loading">
            <a-spin size="large" class="preview-spinner" />
            <p class="preview-loading-text">正在生成网站</p>
          </div>
          <iframe
              v-else
              :src="previewUrl"
              class="preview-iframe"
              frameborder="0"
              @load="onIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
        v-model:open="appDetailVisible"
        :app="appInfo"
        :show-actions="isOwner || isAdmin"
        @edit="editApp"
        @delete="deleteApp"
    />

    <!-- 部署成功弹窗 -->
    <DeploySuccessModal
        v-model:open="deployModalVisible"
        :deploy-url="deployUrl"
        @open-site="openDeployedSite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  cancelAppGeneration,
  getAppVoById,
  deployApp as deployAppApi,
  deleteApp as deleteAppApi,
} from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { CodeGenTypeEnum, formatCodeGenType } from '@/utils/codeGenTypes'
import request from '@/request'

import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import DeploySuccessModal from '@/components/DeploySuccessModal.vue'
import aiAvatar from '@/assets/aiAvatar.png'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
import { VisualEditor, type ElementInfo } from '@/utils/visualEditor'
import {
  CHAT_UPLOAD_ACCEPT,
  CHAT_UPLOAD_MAX_SIZE_MB,
  collectValidChatUploads,
  summarizeUploadedFiles,
} from '@/utils/chatUploads'
import { collectPastedImageFiles } from '@/utils/clipboardUploads'
import { takePendingAppAttachments } from '@/utils/pendingAppAttachments'

import {
  CloudUploadOutlined,
  SendOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
const appId = ref<any>()

// 对话相关
interface Message {
  type: 'user' | 'ai'
  content: string
  loading?: boolean
  thinking?: string
  thinkingExpanded?: boolean
  createTime?: string
}

interface HistoryMessageContentItem {
  text?: string
  url?: string
  type?: string
}

const messages = ref<Message[]>([])
const userInput = ref('')
const isGenerating = ref(false)
const messagesContainer = ref<HTMLElement>()
const abortController = ref<AbortController | null>(null)

// 对话历史相关
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string>()
const historyLoaded = ref(false)
const initialMessageSent = ref(false)

// 预览相关
const previewUrl = ref('')
const previewReady = ref(false)

// 部署相关
const deploying = ref(false)
const deployModalVisible = ref(false)
const deployUrl = ref('')

// 上传文件相关
const uploadedFiles = ref<File[]>([])

// RAG 知识库开关
const useRag = ref(true)

// 初始化应用ID
appId.value = route.params.id

// 可视化编辑
const visualEditor = new VisualEditor({
  onElementSelected: (elementInfo: ElementInfo) => {
    selectedElementInfo.value = elementInfo
  }
})
const isEditMode = ref(false)
const selectedElementInfo = ref<ElementInfo | null>(null)

// 权限
const isOwner = computed(() => appInfo.value?.userId === loginUserStore.loginUser.id)
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

// 应用详情弹窗
const appDetailVisible = ref(false)

// 下载状态
const downloading = ref(false)

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) {
    return
  }

  const result = collectValidChatUploads(Array.from(input.files), uploadedFiles.value)
  uploadedFiles.value = result.files
  result.errors.forEach((error) => message.error(error))
  input.value = ''
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const onInputPaste = (event: ClipboardEvent) => {
  const pastedFiles = collectPastedImageFiles(event)
  if (pastedFiles.length === 0) {
    return
  }

  event.preventDefault()
  const result = collectValidChatUploads(pastedFiles, uploadedFiles.value)
  uploadedFiles.value = result.files
  result.errors.forEach((error) => message.error(error))
}

const buildFormData = (messageText: string, files: File[] = []) => {
  const formData = new FormData()
  formData.append('appId', String(appId.value))
  formData.append('message', messageText)
  formData.append('useRag', String(useRag.value))
  files.forEach((file) => formData.append('files', file))
  return formData
}

const buildUserMessageContent = (messageText: string, files: File[] = []) => {
  if (files.length === 0) {
    return messageText
  }

  const attachmentSummary = summarizeUploadedFiles(files)
  return `${messageText}\n\n已附带${attachmentSummary}：\n${files.map((file) => `- ${file.name}`).join('\n')}`
}

const parseHistoryMessageContent = (rawMessage?: string) => {
  if (!rawMessage) {
    return ''
  }

  try {
    const parsed = JSON.parse(rawMessage)
    if (!Array.isArray(parsed)) {
      return rawMessage
    }

    const items = parsed as HistoryMessageContentItem[]
    const textParts = items
      .map((item) => item.text?.trim())
      .filter((text): text is string => Boolean(text))
    const imageCount = items.filter((item) => typeof item.url === 'string' && item.url.length > 0).length

    if (imageCount > 0) {
      textParts.push(`已附带 ${imageCount} 张参考图片`)
    }

    return textParts.join('\n\n') || rawMessage
  } catch {
    return rawMessage
  }
}

const handleSendMessage = async () => {
  if ((!userInput.value.trim() && uploadedFiles.value.length === 0) || isGenerating.value) {
    return
  }

  const filesToSend = [...uploadedFiles.value]
  let nextMessage = userInput.value.trim() || '(上传了参考文件)'

  if (selectedElementInfo.value) {
    let elementContext = `\n\n选中元素信息：`
    if (selectedElementInfo.value.pagePath) {
      elementContext += `\n- 页面路径: ${selectedElementInfo.value.pagePath}`
    }
    elementContext += `\n- 标签: ${selectedElementInfo.value.tagName.toLowerCase()}\n- 选择器: ${selectedElementInfo.value.selector}`
    if (selectedElementInfo.value.textContent) {
      elementContext += `\n- 当前内容: ${selectedElementInfo.value.textContent.substring(0, 100)}`
    }
    nextMessage += elementContext
  }

  const formData = buildFormData(nextMessage, filesToSend)
  userInput.value = ''
  uploadedFiles.value = []

  messages.value.push({
    type: 'user',
    content: buildUserMessageContent(nextMessage, filesToSend),
  })

  if (selectedElementInfo.value) {
    clearSelectedElement()
    if (isEditMode.value) {
      toggleEditMode()
    }
  }

  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
    thinkingExpanded: true,
  })

  await nextTick()
  scrollToBottom()

  isGenerating.value = true
  await generateCode(formData, aiMessageIndex)
}

// 发送初始消息
const sendInitialMessage = async (prompt: string, files: File[] = []) => {
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: buildUserMessageContent(prompt, files),
  })

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    type: 'ai',
    content: '',
    loading: true,
    thinkingExpanded: true,
  })

  await nextTick()
  scrollToBottom()

  // 构建 FormData
  const formData = buildFormData(prompt, files)

  // 开始生成
  isGenerating.value = true
  await generateCode(formData, aiMessageIndex)
}

// 发送消息
const sendMessage = async () => {
  await handleSendMessage()
}

// 生成代码 - 使用 fetch POST 流式读取
const generateCode = async (formData: FormData, aiMessageIndex: number) => {
  const baseURL = request.defaults.baseURL || API_BASE_URL
  const url = `${baseURL}/app/chat/gen/code`
  let streamCompleted = false

  abortController.value = new AbortController()

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: abortController.value.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errMsg = "请求失败: " + response.status
      try {
        const errJson = JSON.parse(errorText)
        if (errJson.message) errMsg = errJson.message
      } catch { /* ignore */ }
      throw new Error(errMsg)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (streamCompleted) return

        if (line.startsWith('data:')) {
          const data = line.slice(5).trim()
          if (!data) continue

          try {
            // 检查是否是 event: done
            if (data === '[DONE]') {
              streamCompleted = true
              isGenerating.value = false

              setTimeout(async () => {
                await fetchAppInfo()
                updatePreview()
              }, 1000)
              return
            }

            const parsed = JSON.parse(data)
            // 检查是否是业务错误
            if (parsed.error) {
              isGenerating.value = false
              handleError(new Error(parsed.message || "业务错误"), aiMessageIndex)
              return
            }
            const content = parsed.d

            // 拼接内容
            if (content !== undefined && content !== null) {
              // 尝试解析内部 JSON（VUE_PROJECT 格式）
              try {
                const inner = JSON.parse(content)
                if (inner.type === 'thinking') {
                  // 推理过程：单独累积，不混入回答内容
                  if (!messages.value[aiMessageIndex].thinking) {
                    messages.value[aiMessageIndex].thinking = ''
                  }
                  messages.value[aiMessageIndex].thinking += inner.data || ''
                  messages.value[aiMessageIndex].loading = false
                } else if (inner.type === 'ai_response' || inner.type === 'tool_request' || inner.type === 'tool_executed') {
                  // AI 回答内容
                  fullContent += inner.data || ''
                  messages.value[aiMessageIndex].content = fullContent
                  messages.value[aiMessageIndex].loading = false
                  scrollToBottom()
                }
              } catch {
                // HTML/MULTI_FILE 类型：直接拼接纯文本
                fullContent += content
                messages.value[aiMessageIndex].content = fullContent
                messages.value[aiMessageIndex].loading = false
                scrollToBottom()
              }
            }
          } catch {
            // SSE event line (not JSON data)
            if (data.startsWith('event: done') || data === 'done') {
              streamCompleted = true
              isGenerating.value = false
              setTimeout(async () => {
                await fetchAppInfo()
                updatePreview()
              }, 1000)
              return
            }
          }
        } else if (line.startsWith('event:')) {
          const eventType = line.slice(6).trim()
          if (eventType === 'done') {
            streamCompleted = true
            isGenerating.value = false
            setTimeout(async () => {
              await fetchAppInfo()
              updatePreview()
            }, 1000)
            return
          }
        } else if (line.startsWith('id:') || line.startsWith('retry:')) {
          continue
        }
      }
    }

    // 流正常结束
    if (!streamCompleted) {
      streamCompleted = true
      isGenerating.value = false
      setTimeout(async () => {
        await fetchAppInfo()
        updatePreview()
      }, 1000)
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      messages.value[aiMessageIndex].content += '\n\n--- 已中断 ---'
      messages.value[aiMessageIndex].loading = false
      isGenerating.value = false
      abortController.value = null
      return
    }
    console.error('流式请求失败:', error)
    handleError(error, aiMessageIndex)
  }
}

// 停止生成
const stopGeneration = async () => {
  if (abortController.value) {
    abortController.value.abort()
  }
  if (appId.value) {
    try {
      await cancelAppGeneration({ appId: String(appId.value) })
    } catch (error) {
      console.error('取消生成失败：', error)
    }
  }
  isGenerating.value = false
}

// 错误处理函数
const handleError = (error: unknown, aiMessageIndex: number) => {
  const msg = error instanceof Error ? error.message : '生成失败，请重试'
  console.error('生成代码失败：', msg)
  messages.value[aiMessageIndex].content = '抱歉，' + msg
  messages.value[aiMessageIndex].loading = false
  message.error(msg)
  isGenerating.value = false
}

// 获取应用信息
const fetchAppInfo = async () => {
  const id = route.params.id as string
  if (!id) {
    message.error('应用ID不存在')
    return
  }

  appId.value = id

  try {
    const res = await getAppVoById({ id })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data

      if (route.query.view) {
        // 查看已有对话 → 加载聊天历史
        await loadInitialHistory(id)
      } else if (appInfo.value.initPrompt && !initialMessageSent.value) {
        // 新建的应用，发送初始消息
        initialMessageSent.value = true
        const pendingFiles = takePendingAppAttachments(id)
        await sendInitialMessage(appInfo.value.initPrompt, pendingFiles)
      }
    } else {
      message.error('获取应用信息失败：' + res.data.message)
    }
  } catch (error) {
    console.error('获取应用信息失败：', error)
    message.error('获取应用信息失败')
  }
}

// 加载初始聊天历史
const loadInitialHistory = async (appIdStr: string) => {
  try {
    const res = await listAppChatHistory({ appId: appIdStr as any, pageSize: 50 })
    if (res.data.code === 0 && res.data.data) {
      const records = res.data.data.records
      if (records && records.length > 0) {
        const reversed = [...records].reverse()
        const historyMessages: Message[] = reversed
          .filter((r) => r.messageType === 'user' || r.messageType === 'ai')
          .map((r) => ({
            type: r.messageType === 'ai' ? 'ai' : 'user',
            content: parseHistoryMessageContent(r.message) || '',
            createTime: r.createTime,
          }))
        messages.value = historyMessages
        lastCreateTime.value = records[records.length - 1]?.createTime
      }
      hasMoreHistory.value = !!(res.data.data.totalRow && res.data.data.totalRow > (records?.length || 0))
      updatePreview()
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载聊天历史失败：', error)
  }
}

// 加载更多历史消息（向上翻页）
const loadMoreHistory = async () => {
  if (loadingHistory.value || !hasMoreHistory.value) return
  loadingHistory.value = true
  try {
    const res = await listAppChatHistory({
      appId: appId.value as any,
      pageSize: 20,
      lastCreateTime: lastCreateTime.value,
    })
    if (res.data.code === 0 && res.data.data) {
      const records = res.data.data.records
      if (records && records.length > 0) {
        const oldMessages: Message[] = records
          .filter((r) => r.messageType === 'user' || r.messageType === 'ai')
          .map((r) => ({
            type: r.messageType === 'ai' ? 'ai' : 'user',
            content: parseHistoryMessageContent(r.message) || '',
            createTime: r.createTime,
          }))
        messages.value = [...oldMessages.reverse(), ...messages.value]
        lastCreateTime.value = records[records.length - 1]?.createTime
      }
      hasMoreHistory.value = records != null && records.length >= 20
    }
  } catch (error) {
    console.error('加载更多历史消息失败：', error)
  } finally {
    loadingHistory.value = false
  }
}

// 更新预览
const updatePreview = () => {
  if (appId.value) {
    const codeGenType = appInfo.value?.codeGenType || CodeGenTypeEnum.HTML
    const newPreviewUrl = getStaticPreviewUrl(codeGenType, appId.value)
    previewUrl.value = newPreviewUrl
    previewReady.value = true
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 下载代码
const downloadCode = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }
  downloading.value = true
  try {
    const API_BASE_URL = request.defaults.baseURL || ''
    const url = `${API_BASE_URL}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName = contentDisposition?.match(/filename="(.+)"/)?.[1] || `app-${appId.value}.zip`
    // 下载文件
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    link.click()
    // 清理
    URL.revokeObjectURL(downloadUrl)
    message.success('代码下载成功')
  } catch (error) {
    console.error('下载失败：', error)
    message.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

// 部署应用
const deployApp = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  deploying.value = true
  try {
    const res = await deployAppApi({
      appId: String(appId.value),
    })

    if (res.data.code === 0 && res.data.data) {
      deployUrl.value = res.data.data
      deployModalVisible.value = true
      message.success('部署成功')
    } else {
      message.error('部署失败：' + res.data.message)
    }
  } catch (error) {
    console.error('部署失败：', error)
    message.error('部署失败，请重试')
  } finally {
    deploying.value = false
  }
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 打开部署的网站
const openDeployedSite = () => {
  if (deployUrl.value) {
    window.open(deployUrl.value, '_blank')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  previewReady.value = true
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (iframe) {
    visualEditor.init(iframe)
    visualEditor.onIframeLoad()
  }
}

// 显示应用详情
const showAppDetail = () => {
  appDetailVisible.value = true
}

// 编辑应用
const editApp = () => {
  if (appInfo.value?.id) {
    router.push(`/app/edit/${appInfo.value.id}`)
  }
}

// 删除应用
const deleteApp = async () => {
  if (!appInfo.value?.id) return

  try {
    const res = await deleteAppApi({ id: appInfo.value.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailVisible.value = false
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    console.error('删除失败：', error)
    message.error('删除失败')
  }
}

// 可视化编辑相关函数
const toggleEditMode = () => {
  // 检查 iframe 是否已经加载
  const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement
  if (!iframe) {
    message.warning('请等待页面加载完成')
    return
  }
  // 确保 visualEditor 已初始化
  if (!previewReady.value) {
    message.warning('请等待页面加载完成')
    return
  }
  const newEditMode = visualEditor.toggleEditMode()
  isEditMode.value = newEditMode
}

const clearSelectedElement = () => {
  selectedElementInfo.value = null
  visualEditor.clearSelection()
}

const getInputPlaceholder = () => {
  if (selectedElementInfo.value) {
    return `正在编辑 ${selectedElementInfo.value.tagName.toLowerCase()} 元素，描述您想要的修改...`
  }
  return `请描述你想生成的网站，也可以搭配图片或文本文件，单个文件不超过 ${CHAT_UPLOAD_MAX_SIZE_MB}MB`
}

// 页面加载时获取应用信息
onMounted(() => {
  fetchAppInfo()

  // 监听 iframe 消息
  window.addEventListener('message', (event) => {
    visualEditor.handleIframeMessage(event)
  })
})

// 清理资源
onUnmounted(() => {
  // EventSource 会在组件卸载时自动清理
})
</script>

<style scoped>
#appChatPage {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: transparent;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-gen-type-tag {
  font-size: 12px;
}

.app-name {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: var(--ai-title);
  letter-spacing: 0.02em;
}

.header-right {
  display: flex;
  gap: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 14px;
  padding: 4px 8px 8px;
  overflow: hidden;
}

.chat-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: rgba(21, 23, 32, 0.55);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.messages-container {
  flex: 0.9;
  padding: 14px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: 14px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 8px;
}

.ai-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.message-content {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 10px;
  line-height: 1.6;
  word-wrap: break-word;
  font-size: 14px;
  letter-spacing: 0.01em;
}

.user-message .message-content {
  background: linear-gradient(135deg, #4f7cff, #2d4fc7);
  color: #fff;
}

.ai-message .message-content {
  background: rgba(255, 255, 255, 0.03);
  color: var(--ai-title);
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.thinking-bubble {
  margin-bottom: 10px;
  border: 1px solid rgba(255, 184, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 184, 0, 0.03);
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--ai-muted);
  transition: background 0.2s;
}

.thinking-header:hover {
  background: rgba(255, 184, 0, 0.05);
}

.thinking-icon {
  font-size: 14px;
}

.thinking-toggle {
  margin-left: auto;
  font-size: 12px;
  color: var(--ai-muted);
}

.thinking-body {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 184, 0, 0.1);
  font-size: 13px;
  color: var(--ai-text);
  line-height: 1.7;
}

.message-avatar {
  flex-shrink: 0;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ai-muted);
  font-size: 14px;
  letter-spacing: 0.01em;
}

.load-more-container {
  text-align: center;
  padding: 6px 0;
  margin-bottom: 14px;
}

.load-more-container :deep(.ant-btn-link) {
  color: var(--ai-muted);
  font-size: 13px;
}

.load-more-container :deep(.ant-btn-link:hover) {
  color: var(--ai-primary);
}

.input-container {
  padding: 8px 14px;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.input-wrapper {
  position: relative;
}

.input-wrapper :deep(.ant-input) {
  padding-right: 16px;
  padding-bottom: 54px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  color: var(--ai-title);
  font-size: 14px;
  letter-spacing: 0.01em;
  caret-color: var(--ai-primary);
}

.input-wrapper :deep(.ant-input:focus) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}

.input-wrapper :deep(.ant-input::placeholder) {
  color: var(--ai-muted);
}

.upload-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 0 8px;
}

.upload-file {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  color: var(--ai-text);
  max-width: 180px;
}

.upload-file-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.upload-file-close {
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  color: var(--ai-muted);
  transition: color 0.2s;
}

.upload-file-close:hover {
  color: #ff4d4f;
}

.input-actions {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.input-actions-center {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.glass-toggle {
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
}
.glass-toggle-track {
  position: relative;
  width: 60px;
  height: 28px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.glass-toggle.active .glass-toggle-track {
  background: rgba(79, 124, 255, 0.2);
  border-color: rgba(79, 124, 255, 0.3);
  box-shadow: 0 0 12px rgba(79, 124, 255, 0.12);
}
.glass-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ai-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.glass-toggle.active .glass-toggle-knob {
  left: 35px;
  background: #4f7cff;
  color: #fff;
  box-shadow: 0 0 12px rgba(79, 124, 255, 0.35);
}

.input-actions-end {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--ai-muted);
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  font-size: 13px;
  transition: all 0.3s;
  user-select: none;
  pointer-events: auto;
}

.upload-label:hover {
  color: var(--ai-primary) !important;
  border-color: rgba(79, 124, 255, 0.2) !important;
  background: rgba(79, 124, 255, 0.04) !important;
}

.send-button :deep(.ant-btn-loading-icon .anticon) {
  display: inline-flex;
  color: rgba(255, 255, 255, 0.95);
  animation: spin-ring 0.9s linear infinite;
}

.send-button {
  flex-shrink: 0;
  pointer-events: auto;
}

.send-button :deep(.ant-btn-loading-icon .anticon svg) {
  width: 14px;
  height: 14px;
}

.stop-button {
  flex-shrink: 0;
  pointer-events: auto;
}

.preview-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: rgba(21, 23, 32, 0.55);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.preview-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ai-title);
  letter-spacing: 0.02em;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.12);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ai-muted);
  letter-spacing: 0.02em;
}

.placeholder-icon {
  font-size: 40px;
  margin-bottom: 14px;
  opacity: 0.4;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.preview-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 1px solid rgba(79, 124, 255, 0.1);
  background: rgba(79, 124, 255, 0.03);
  box-shadow: 0 8px 24px rgba(79, 124, 255, 0.06);
  animation: breathe 3s ease-in-out infinite;
}

.preview-spinner :deep(.ant-spin-dot) {
  width: 30px;
  height: 30px;
  animation: spin-ring 1s linear infinite;
}

.preview-spinner :deep(.ant-spin-dot-item) {
  width: 11px;
  height: 11px;
  background: linear-gradient(135deg, #4f7cff, #7dd3fc);
  box-shadow: 0 0 10px rgba(79, 124, 255, 0.2);
}

.preview-loading-text {
  margin-top: 16px;
  color: var(--ai-title);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.04em;
}

.preview-loading-text::after {
  content: '';
  display: inline-block;
  width: 0;
  margin-left: 2px;
  animation: loading-dots 1.2s steps(4, end) infinite;
}

@keyframes loading-dots {
  0% { width: 0; }
  25% { width: 0.3em; }
  50% { width: 0.6em; }
  75% { width: 0.9em; }
  100% { width: 1.2em; }
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.selected-element-alert {
  margin: 0 16px;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  .chat-section,
  .preview-section {
    flex: none;
    height: 50vh;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 8px 14px 10px;
  }
  .app-name {
    font-size: 15px;
  }
  .main-content {
    padding: 4px 6px 6px;
    gap: 8px;
  }
  .message-content {
    max-width: 85%;
  }

  .selected-element-alert {
    margin: 0 14px;
  }
  .selected-element-info {
    line-height: 1.4;
  }
  .element-header {
    margin-bottom: 6px;
  }
  .element-details {
    margin-top: 6px;
  }
  .element-item {
    margin-bottom: 3px;
    font-size: 13px;
  }
  .element-item:last-child {
    margin-bottom: 0;
  }
  .element-tag {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    font-weight: 500;
    color: #4f7cff;
  }
  .element-id {
    color: #7dd3fc;
    margin-left: 4px;
  }
  .element-class {
    color: #fbbf24;
    margin-left: 4px;
  }
  .element-selector-code {
    font-family: 'Monaco', 'Menlo', monospace;
    background: rgba(255, 255, 255, 0.03);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 12px;
    color: #f87171;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .edit-mode-active {
    background-color: #52c41a !important;
    border-color: #52c41a !important;
    color: white !important;
  }
  .edit-mode-active:hover {
    background-color: #73d13d !important;
    border-color: #73d13d !important;
  }
}
</style>
