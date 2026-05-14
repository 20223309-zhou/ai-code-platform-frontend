<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'
import {
  CHAT_UPLOAD_ACCEPT,
  CHAT_UPLOAD_MAX_SIZE_MB,
  collectValidChatUploads,
  summarizeUploadedFiles,
} from '@/utils/chatUploads'
import { collectPastedImageFiles } from '@/utils/clipboardUploads'
import { setPendingAppAttachments } from '@/utils/pendingAppAttachments'
import { CloudUploadOutlined, CloseOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()
let handleMouseMove: ((e: MouseEvent) => void) | null = null

const userPrompt = ref('')
const creating = ref(false)
const activeTemplate = ref('')
const uploadedFiles = ref<File[]>([])

const platformSkills = [
  { name: '✔ form-validation-patterns', desc: '智能表单校验：联动规则、动态表单项、实时反馈' },
  { name: '✔ table-list-patterns', desc: '高效列表页：搜索分页、批量操作、数据表格' },
  { name: '✔ api-call-pattern', desc: '标准API封装：loading/error/empty 三态处理' },
  { name: '✔ responsive-breakpoints', desc: '响应式布局：导航折叠、断点适配' },
  { name: '✔ design-tokens', desc: '设计Token体系：CSS变量、暗色模式、间距节奏' },
  { name: '✔ micro-interactions', desc: '微交互：骨架屏、空状态、过渡动画、操作反馈' },
]

const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const templates = [
  {
    label: '个人博客网站',
    prompt:
      '创建一个现代化的个人博客网站，包含文章列表、详情页、分类标签、搜索功能、评论系统和个人简介页面。采用简洁的设计风格，支持响应式布局，文章支持Markdown格式，首页展示最新文章和热门推荐。',
  },
  {
    label: '企业官网',
    prompt:
      '设计一个专业的企业官网，包含公司介绍、产品服务展示、新闻资讯、联系我们等页面。采用商务风格的设计，包含轮播图、产品展示卡片、团队介绍、客户案例展示，支持多语言切换和在线客服功能。',
  },
  {
    label: '在线商城',
    prompt:
      '构建一个功能完整的在线商城，包含商品展示、购物车、用户注册登录、订单管理、支付结算等功能。设计现代化的商品卡片布局，支持商品搜索筛选、用户评价、优惠券系统和会员积分功能。',
  },
  {
    label: '作品展示网站',
    prompt:
      '制作一个精美的作品展示网站，适合设计师、摄影师、艺术家等创作者。包含作品画廊、项目详情页、个人简历、联系方式等模块。采用瀑布流或网格布局展示作品，支持图片放大预览和作品分类筛选。',
  },
]

const hasMyApps = computed(() => myApps.value.length > 0)
const uploadHint = computed(
  () => `支持图片和文本文件，单个文件不超过 ${CHAT_UPLOAD_MAX_SIZE_MB}MB`,
)

const setPrompt = (prompt: string, label: string) => {
  userPrompt.value = prompt
  activeTemplate.value = label
}

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

const onPromptPaste = (event: ClipboardEvent) => {
  const pastedFiles = collectPastedImageFiles(event)
  if (pastedFiles.length === 0) {
    return
  }

  event.preventDefault()
  const result = collectValidChatUploads(pastedFiles, uploadedFiles.value)
  uploadedFiles.value = result.files
  result.errors.forEach((error) => message.error(error))
}

const createApp = async () => {
  if (!userPrompt.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({
      initPrompt: userPrompt.value.trim(),
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      const appId = String(res.data.data)
      setPendingAppAttachments(appId, uploadedFiles.value)
      uploadedFiles.value = []
      await router.push(`/app/chat/${appId}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    console.error('创建应用失败：', error)
    message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

const loadMyApps = async () => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: myAppsPage.current,
      pageSize: myAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载我的应用失败：', error)
  }
}

const viewChat = (appId: string | number | undefined) => {
  if (appId) {
    router.push(`/app/chat/${appId}?view=1`)
  }
}

const viewWork = (app: API.AppVO) => {
  if (app.deployKey) {
    const url = getDeployUrl(app.deployKey)
    window.open(url, '_blank')
  }
}

onMounted(async () => {
  loadMyApps()

  handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    const x = (clientX / innerWidth) * 100
    const y = (clientY / innerHeight) * 100
    document.documentElement.style.setProperty('--mouse-x', `${x}%`)
    document.documentElement.style.setProperty('--mouse-y', `${y}%`)
  }

  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (handleMouseMove) {
    document.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<template>
  <div id="homePage">
    <div class="page-shell">
      <section class="hero-section fade-section is-visible">
        <div class="hero-badge">智能生成 · 低代码 · 未来体验</div>
        <h1 class="hero-title">iCodeAI 应用生成平台</h1>
        <p class="hero-description">一句自然语言，快速生成完整应用原型与交互体验。</p>
      </section>

      <section class="generator-panel fade-section is-visible">
        <div class="generator-header">
          <div>
            <h2 class="panel-title">开始生成</h2>
            <p class="panel-subtitle">描述你的业务目标、页面结构或交互想法，AI 将开始生成。</p>
          </div>
        </div>

        <div class="input-shell" :class="{ 'is-creating': creating }">
          <a-textarea
            v-model:value="userPrompt"
            placeholder="例如：帮我创建一个现代 AI SaaS 官网，带定价、案例、登录和控制台页面"
            :rows="4"
            :maxlength="1000"
            class="prompt-input"
            @keydown.enter.prevent="createApp"
            @paste="onPromptPaste"
          />
          <button class="generate-button" type="button" @click="createApp" :disabled="creating">
            <span v-if="!creating" class="generate-arrow">&#8594;</span>
            <span v-else class="generate-loader" aria-hidden="true">
              <svg viewBox="0 0 40 40" class="loader-ring">
                <circle cx="20" cy="20" r="16" class="loader-ring-track" />
                <circle cx="20" cy="20" r="16" class="loader-ring-path" />
              </svg>
              <span class="loader-pulse"></span>
            </span>
          </button>
        </div>

        <div class="composer-tools">
          <div class="upload-panel">
            <label class="upload-trigger" :class="{ 'is-disabled': creating }">
              <CloudUploadOutlined />
              <span>上传附件</span>
              <input
                type="file"
                :accept="CHAT_UPLOAD_ACCEPT"
                multiple
                :disabled="creating"
                @change="onFileChange"
              />
            </label>
            <a-popover placement="topLeft" trigger="hover" :mouseEnterDelay="0.1">
              <template #content>
                <div class="skills-popover">
                  <div class="skills-title">平台 AI Skills</div>
                  <div v-for="skill in platformSkills" :key="skill.name" class="skill-item">
                    <div class="skill-name">{{ skill.name }}</div>
                    <div class="skill-desc">{{ skill.desc }}</div>
                  </div>
                </div>
              </template>
              <label class="skills-trigger" :class="{ 'is-disabled': creating }">
                <span class="skills-icon">⚡</span>
                <span>AI Skills</span>
              </label>
            </a-popover>
            <p class="upload-hint">{{ uploadHint }}</p>
          </div>
          <div v-if="uploadedFiles.length > 0" class="upload-preview">
            <div class="upload-summary">已选择 {{ summarizeUploadedFiles(uploadedFiles) }}</div>
            <div class="upload-list">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="`${file.name}-${file.lastModified}`"
                class="upload-chip"
              >
                <span class="upload-chip-name">{{ file.name }}</span>
                <button
                  type="button"
                  class="upload-chip-remove"
                  :disabled="creating"
                  @click="removeFile(index)"
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="quick-actions" role="list">
          <button
            v-for="item in templates"
            :key="item.label"
            type="button"
            class="template-chip"
            :class="{ 'is-active': activeTemplate === item.label }"
            @click="setPrompt(item.prompt, item.label)"
          >
            {{ item.label }}
          </button>
        </div>
      </section>

      <section class="section fade-section is-visible">
        <div class="section-heading">
          <h2 class="section-title">我的作品</h2>
          <p class="section-desc">持续迭代你的应用创意，查看每个项目的生成结果与对话记录。</p>
        </div>

        <div v-if="hasMyApps" class="app-grid">
          <AppCard
            v-for="app in myApps"
            :key="app.id"
            :app="app"
            @view-chat="viewChat"
            @view-work="viewWork"
          />
        </div>

        <div v-else class="empty-state">
          <svg viewBox="0 0 160 140" class="empty-illustration" aria-hidden="true">
            <rect x="24" y="14" width="112" height="84" rx="10" class="illu-window" />
            <rect x="32" y="22" width="16" height="16" rx="5" class="illu-accent" />
            <rect x="52" y="22" width="80" height="4" rx="2" class="illu-bar" />
            <rect x="52" y="30" width="60" height="4" rx="2" class="illu-bar" />
            <rect x="52" y="38" width="40" height="4" rx="2" class="illu-bar" />
            <rect x="32" y="52" width="96" height="38" rx="6" class="illu-card" />
            <circle cx="48" cy="66" r="5" class="illu-accent" />
            <rect x="58" y="62" width="62" height="3" rx="1.5" class="illu-bar" />
            <rect x="58" y="70" width="42" height="3" rx="1.5" class="illu-bar" />
            <rect x="58" y="78" width="28" height="3" rx="1.5" class="illu-bar" />
            <path d="M128 98 L136 98 L134 108 L130 108 Z" class="illu-cursor" />
          </svg>
          <h3 class="empty-title">还没有生成作品</h3>
          <p class="empty-desc">从上方模板开始，或直接输入你的需求，让 AI 为你搭建第一个应用。</p>
        </div>

        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="myAppsPage.current"
            v-model:page-size="myAppsPage.pageSize"
            :total="myAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `共 ${total} 个应用`"
            @change="loadMyApps"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
#homePage {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: transparent;
}

/* 鼠标跟随光晕 — 最上层 */
#homePage::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    640px circle at var(--mouse-x, 50%) var(--mouse-y, 18%),
    rgba(79, 124, 255, 0.06),
    transparent 68%
  );
  pointer-events: none;
  z-index: 2;
}

.page-shell {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 20px 64px;
}

.fade-section {
  opacity: 0;
  transform: translateY(20px);
}

.fade-section.is-visible {
  animation: fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero-section {
  padding: 56px 0 36px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 14px;
  border: 1px solid rgba(79, 124, 255, 0.15);
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.06);
  color: var(--ai-primary);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.hero-title {
  margin: 22px 0 14px;
  color: var(--ai-title);
  font-size: clamp(34px, 5.5vw, 52px);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.hero-description {
  max-width: 520px;
  margin: 0 auto;
  color: var(--ai-muted);
  font-size: 16px;
  line-height: 1.7;
  letter-spacing: 0.02em;
}

.generator-panel {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 28px 28px 32px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(21, 23, 32, 0.65);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.32);
}

.generator-header {
  margin-bottom: 20px;
}

.panel-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.panel-subtitle {
  margin: 6px 0 0;
  color: var(--ai-muted);
  font-size: 14px;
  letter-spacing: 0.01em;
}

.input-shell {
  position: relative;
  margin-bottom: 16px;
}

:deep(.prompt-input.ant-input) {
  min-height: 144px;
  padding: 16px 72px 16px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--ai-control-radius);
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  color: var(--ai-title);
  font-size: 14px;
  line-height: 1.7;
  letter-spacing: 0.01em;
  resize: none;
  caret-color: var(--ai-primary);
  transition: border-color 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1),
              background 0.3s ease;
}

:deep(.prompt-input.ant-input:focus),
:deep(.prompt-input.ant-input-focused) {
  border-color: rgba(79, 124, 255, 0.25);
  background: rgba(255, 255, 255, 0.03);
  box-shadow:
    inset 0 0 0 1px rgba(79, 124, 255, 0.08),
    0 0 24px rgba(79, 124, 255, 0.04);
  animation: breathe-subtle 3s ease-in-out infinite;
}

:deep(.prompt-input.ant-input::placeholder) {
  color: var(--ai-muted);
  font-style: italic;
  letter-spacing: 0.01em;
}

.generate-button {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f7cff, #2d4fc7);
  color: #fff;
  box-shadow: 0 6px 20px rgba(79, 124, 255, 0.25);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.generate-button:hover {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 10px 28px rgba(79, 124, 255, 0.35);
}

.generate-button:active {
  transform: scale(0.94);
}

.input-shell.is-creating .generate-button {
  animation: breathe 2.4s ease-in-out infinite;
}

.generate-button:disabled {
  cursor: default;
}

.composer-tools {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.upload-panel {
  min-width: 0;
}

.upload-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(79, 124, 255, 0.14);
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.06);
  color: var(--ai-title);
  font-size: 13px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: var(--ai-transition);
}

.upload-trigger:hover {
  transform: translateY(-1px);
  border-color: rgba(79, 124, 255, 0.22);
  background: rgba(79, 124, 255, 0.09);
  box-shadow: 0 10px 28px rgba(79, 124, 255, 0.12);
}

.upload-trigger.is-disabled {
  cursor: default;
  opacity: 0.65;
  box-shadow: none;
  transform: none;
}

.upload-trigger input {
  display: none;
}

.skills-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.06);
  color: rgba(232, 233, 234, 0.9);
  font-size: 13px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: var(--ai-transition);
}

.skills-trigger:hover {
  transform: translateY(-1px);
  border-color: rgba(125, 211, 252, 0.3);
  background: rgba(125, 211, 252, 0.1);
  box-shadow: 0 10px 28px rgba(125, 211, 252, 0.12);
}

.skills-trigger.is-disabled {
  cursor: default;
  opacity: 0.65;
  box-shadow: none;
  transform: none;
}

.skills-trigger .skills-icon {
  font-size: 14px;
}

.skills-popover {
  max-width: 320px;
}

.skills-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ai-title);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.skill-item {
  padding: 6px 0;
}

.skill-item + .skill-item {
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.skill-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ai-title);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

.skill-desc {
  font-size: 12px;
  color: var(--ai-muted);
  margin-top: 2px;
  line-height: 1.5;
}

.upload-hint {
  margin: 8px 0 0;
  color: var(--ai-muted);
  font-size: 12px;
  line-height: 1.6;
}

.upload-preview {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.upload-summary {
  margin-bottom: 10px;
  color: var(--ai-title);
  font-size: 13px;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--ai-text);
  font-size: 12px;
}

.upload-chip-name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--ai-muted);
  cursor: pointer;
  transition: var(--ai-transition);
}

.upload-chip-remove:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  color: var(--ai-title);
}

.upload-chip-remove:disabled {
  cursor: default;
  opacity: 0.5;
}

.generate-arrow {
  font-size: 18px;
  line-height: 1;
}

.generate-loader {
  position: relative;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loader-ring {
  width: 28px;
  height: 28px;
  animation: spin-ring 1.2s linear infinite;
}

.loader-ring-track,
.loader-ring-path {
  fill: none;
  stroke-width: 2.5;
}

.loader-ring-track {
  stroke: rgba(255, 255, 255, 0.15);
}

.loader-ring-path {
  stroke: #7dd3fc;
  stroke-linecap: round;
  stroke-dasharray: 64;
  stroke-dashoffset: 20;
}

.loader-pulse {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: rgba(125, 211, 252, 0.1);
  filter: blur(4px);
  animation: pulse-ring 1.8s ease-out infinite;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.template-chip {
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--ai-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.template-chip:hover {
  border-color: rgba(79, 124, 255, 0.15);
  color: var(--ai-title);
  background: rgba(79, 124, 255, 0.04);
  transform: translateY(-1px);
}

.template-chip.is-active {
  background: rgba(79, 124, 255, 0.08);
  color: var(--ai-primary);
  border-color: rgba(79, 124, 255, 0.2);
  font-weight: 500;
}

.section {
  margin-bottom: 56px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.section-desc {
  margin: 0;
  max-width: 440px;
  color: var(--ai-muted);
  font-size: 14px;
  text-align: right;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.app-grid,
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 340px));
  justify-content: flex-start;
  gap: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 44px 24px 40px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.015);
  text-align: center;
}

.empty-illustration {
  width: 160px;
  max-width: 100%;
  margin-bottom: 14px;
  opacity: 0.4;
}

.illu-window {
  fill: rgba(255, 255, 255, 0.015);
  stroke: rgba(79, 124, 255, 0.2);
  stroke-width: 1.5;
}

.illu-accent {
  fill: rgba(79, 124, 255, 0.3);
}

.illu-card {
  fill: rgba(255, 255, 255, 0.02);
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 1;
}

.illu-bar {
  fill: rgba(255, 255, 255, 0.08);
}

.illu-cursor {
  fill: rgba(125, 211, 252, 0.5);
}

.empty-title {
  margin: 4px 0 8px;
  color: var(--ai-title);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.empty-desc {
  max-width: 380px;
  margin: 0;
  color: var(--ai-muted);
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

@media (max-width: 1024px) {
  .composer-tools {
    flex-direction: column;
  }

  .upload-preview {
    width: 100%;
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-shell {
    padding: 36px 16px 48px;
  }

  .generator-panel {
    padding: 22px;
  }

  .upload-trigger {
    width: 100%;
    justify-content: center;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-desc {
    text-align: left;
  }

  .app-grid,
  .featured-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .hero-description {
    font-size: 15px;
  }
}

@media (max-width: 640px) {
  .generator-panel {
    max-width: 100%;
  }

  :deep(.prompt-input.ant-input) {
    min-height: 160px;
  }

  .upload-chip-name {
    max-width: 170px;
  }
}
</style>
