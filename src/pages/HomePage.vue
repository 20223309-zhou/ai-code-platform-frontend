<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage } from '@/api/appController'
import { getLoginUser } from '@/api/userController'
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
import { CodeGenTypeEnum, CODE_GEN_TYPE_CREATE_OPTIONS } from '@/utils/codeGenTypes'
import { loadModelOptions, pickDefaultModelName } from '@/utils/aiModels'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const userPrompt = ref('')
const creating = ref(false)
const useRag = ref(false)
const activeTemplate = ref('')
// 生成类型（创建时指定，创建后不可更改）：默认“智能选择”，由 AI 自动路由
const selectedCodeGenType = ref<string>(CodeGenTypeEnum.AUTO)
// 本次生成使用的模型（创建后由聊天页继续沿用，可在聊天页随时切换）
const selectedModel = ref<string>('')
const modelOptions = ref<{ label: string; value: string }[]>([])
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
  () => `支持图片和txt、md文档，单个文件不超过 ${CHAT_UPLOAD_MAX_SIZE_MB}MB`,
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
      codeGenType: selectedCodeGenType.value,
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      // 刷新用户信息（额度可能已扣减）
      getLoginUser().then(userRes => {
        if (userRes.data.code === 0 && userRes.data.data) {
          loginUserStore.setLoginUser(userRes.data.data)
        }
      })
      const appId = String(res.data.data)
      setPendingAppAttachments(appId, uploadedFiles.value)
      uploadedFiles.value = []
      const modelQuery = selectedModel.value ? `&modelName=${encodeURIComponent(selectedModel.value)}` : ''
      await router.push(`/app/chat/${appId}?useRag=${useRag.value}${modelQuery}`)
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
  // 加载可选模型列表，默认选中后端标记的默认模型
  loadModelOptions().then((options) => {
    modelOptions.value = options
    if (!selectedModel.value) {
      selectedModel.value = pickDefaultModelName(options)
    }
  })

  // 性能：原先这里监听 mousemove 并逐帧写 --mouse-x/--mouse-y 到根元素，
  // 而 #homePage::after 是铺满视口的光晕层 → 每次移动鼠标都会触发整屏样式重算 + 重绘。
  // 现改为静态光晕（见样式中的 radial-gradient），彻底去掉这条逐帧开销。
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
        <!-- 剪纸小狐狸：贴在卡片右上角的纸片 -->
        <svg class="paper-fox" viewBox="0 0 120 120" aria-hidden="true">
          <!-- 纸片厚度（向下右偏移的深色副本） -->
          <g transform="translate(2.6,3)" fill="#b35f32">
            <path d="M22 42 L14 10 L46 30 Z" />
            <path d="M98 42 L106 10 L74 30 Z" />
            <path d="M60 22 C33 22 19 41 19 60 C19 85 38 102 60 102 C82 102 101 85 101 60 C101 41 87 22 60 22 Z" />
          </g>
          <!-- 外耳 -->
          <path d="M22 42 L14 10 L46 30 Z" fill="#d97a45" />
          <path d="M98 42 L106 10 L74 30 Z" fill="#d97a45" />
          <!-- 内耳 -->
          <path d="M26 38 L21 19 L40 31 Z" fill="#f6d9be" />
          <path d="M94 38 L99 19 L80 31 Z" fill="#f6d9be" />
          <!-- 头 -->
          <path d="M60 22 C33 22 19 41 19 60 C19 85 38 102 60 102 C82 102 101 85 101 60 C101 41 87 22 60 22 Z" fill="#e88a50" />
          <!-- 口鼻 -->
          <path d="M60 64 C48 64 40 74 40 84 C40 94 49 101 60 101 C71 101 80 94 80 84 C80 74 72 64 60 64 Z" fill="#fff6e6" />
          <!-- 鼻子 -->
          <path d="M60 68 L68 77 L60 84 L52 77 Z" fill="#5a4535" />
          <!-- 眼睛 -->
          <circle cx="43" cy="59" r="4.6" fill="#4a3f33" />
          <circle cx="77" cy="59" r="4.6" fill="#4a3f33" />
          <!-- 腮红 -->
          <ellipse cx="33" cy="75" rx="6" ry="4" fill="#f2b48c" opacity="0.8" />
          <ellipse cx="87" cy="75" rx="6" ry="4" fill="#f2b48c" opacity="0.8" />
        </svg>
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
            :rows="3"
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

        <div class="type-selector">
          <div class="type-selector-item">
            <span class="type-selector-label">生成类型</span>
            <a-select
              v-model:value="selectedCodeGenType"
              :options="CODE_GEN_TYPE_CREATE_OPTIONS"
              :disabled="creating"
              size="small"
              class="type-select"
            />
          </div>
          <div class="type-selector-item">
            <span class="type-selector-label">模型</span>
            <a-select
              v-model:value="selectedModel"
              :options="modelOptions"
              :disabled="creating"
              size="small"
              class="type-select type-select--model"
              placeholder="默认模型"
            />
          </div>
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
          <a-tooltip title="RAG:开启后 AI 会从已部署的模板库中检索风格相似的代码块作为参考">
            <label class="glass-toggle" :class="{ active: useRag }">
              <input type="checkbox" v-model="useRag" style="display: none" />
              <span class="glass-toggle-track">
                <span class="glass-toggle-knob">R</span>
              </span>
            </label>
          </a-tooltip>
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

/* 静态光晕 — 最上层（原为鼠标跟随，逐帧重绘全屏，已改为固定位置） */
#homePage::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    640px circle at 50% 18%,
    rgba(var(--ai-accent-rgb), 0.06),
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
  border: 1px solid rgba(var(--ai-accent-rgb), 0.15);
  border-radius: 999px;
  background: rgba(var(--ai-accent-rgb), 0.06);
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
  position: relative;
  max-width: 800px;
  margin: 0 auto 52px;
  padding: 24px 24px 26px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  /* 整卡略降不透明度，和内部输入框形成玻璃层次，避免整体发白 */
  background: rgba(255, 255, 255, 0.48);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-shadow:
    0 1px 2px rgba(var(--ai-ink-rgb), 0.06),
    0 24px 60px -12px rgba(var(--ai-ink-rgb), 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* 顶部柔和蓝紫描光，强化卡片从彩色底"浮起"的层次 */
.generator-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 18%;
  right: 18%;
  height: 1px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95), transparent);
  pointer-events: none;
}

.generator-header {
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: var(--ai-muted);
  font-size: 13px;
  letter-spacing: 0.01em;
}

.input-shell {
  position: relative;
  margin-bottom: 12px;
}

:deep(.prompt-input.ant-input) {
  min-height: 96px;
  padding: 12px 60px 12px 14px;
  border: 1px solid rgba(var(--ai-ink-rgb), 0.12);
  border-radius: var(--ai-control-radius);
  /* 半透明玻璃态：让底层彩色渐变透出来，避免纯白单调 */
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: inset 0 1px 2px rgba(var(--ai-ink-rgb), 0.03);
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

:deep(.prompt-input.ant-input:hover) {
  background: rgba(255, 255, 255, 0.32);
}

:deep(.prompt-input.ant-input:focus),
:deep(.prompt-input.ant-input-focused) {
  border-color: rgba(var(--ai-accent-rgb), 0.45);
  background: rgba(255, 255, 255, 0.45);
  box-shadow:
    0 0 0 3px rgba(var(--ai-accent-rgb), 0.08),
    0 0 24px rgba(var(--ai-accent-rgb), 0.06);
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
  background: linear-gradient(135deg, var(--ai-primary), var(--ai-primary-strong));
  color: #fff;
  box-shadow: 0 6px 18px rgba(var(--ai-accent-rgb), 0.28);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.generate-button:hover {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 10px 26px rgba(var(--ai-accent-rgb), 0.34);
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
  margin-bottom: 12px;
}

.upload-panel {
  min-width: 0;
}

.upload-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(var(--ai-accent-rgb), 0.14);
  border-radius: 999px;
  background: rgba(var(--ai-accent-rgb), 0.06);
  color: var(--ai-title);
  font-size: 13px;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: var(--ai-transition);
}

.upload-trigger:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--ai-accent-rgb), 0.22);
  background: rgba(var(--ai-accent-rgb), 0.09);
  box-shadow: 0 10px 28px rgba(var(--ai-accent-rgb), 0.12);
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

.glass-toggle {
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.glass-toggle-track {
  position: relative;
  width: 60px;
  height: 28px;
  border-radius: 14px;
  background: rgba(var(--ai-ink-rgb), 0.08);
  border: 1px solid rgba(var(--ai-ink-rgb), 0.08);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.glass-toggle.active .glass-toggle-track {
  background: rgba(var(--ai-accent-rgb), 0.2);
  border-color: rgba(var(--ai-accent-rgb), 0.3);
  box-shadow: 0 0 12px rgba(var(--ai-accent-rgb), 0.12);
}
.glass-toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
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
  background: var(--ai-primary);
  color: #fff;
  box-shadow: 0 0 12px rgba(var(--ai-accent-rgb), 0.35);
}

.skills-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 999px;
  background: rgba(var(--ai-accent-rgb), 0.06);
  color: var(--ai-title);
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
  border-bottom: 1px solid rgba(var(--ai-ink-rgb), 0.08);
}

.skill-item {
  padding: 6px 0;
}

.skill-item + .skill-item {
  border-top: 1px solid rgba(var(--ai-ink-rgb), 0.05);
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
  border: 1px solid rgba(var(--ai-ink-rgb), 0.1);
  border-radius: 12px;
  background: rgba(var(--ai-ink-rgb), 0.03);
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
  border: 1px solid rgba(var(--ai-ink-rgb), 0.1);
  border-radius: 999px;
  background: rgba(var(--ai-ink-rgb), 0.05);
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
  background: rgba(var(--ai-ink-rgb), 0.08);
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
  stroke: #e8a33d;
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
  border: 1px solid rgba(var(--ai-ink-rgb), 0.1);
  border-radius: 8px;
  background: rgba(var(--ai-ink-rgb), 0.03);
  color: var(--ai-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.template-chip:hover {
  border-color: rgba(var(--ai-accent-rgb), 0.15);
  color: var(--ai-title);
  background: rgba(var(--ai-accent-rgb), 0.04);
  transform: translateY(-1px);
}

.template-chip.is-active {
  background: rgba(var(--ai-accent-rgb), 0.08);
  color: var(--ai-primary);
  border-color: rgba(var(--ai-accent-rgb), 0.2);
  font-weight: 500;
}

.type-selector {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 12px;
}

/* 每枚下拉 = 一枚冷色胶囊：不描边，只用底色与面板区分 */
.type-selector-item {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 14px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(180deg, rgba(var(--ai-accent-rgb), 0.1), rgba(var(--ai-accent-rgb), 0.065));
  box-shadow: none;
  /* 渐变无法插值动画，故只过渡阴影，避免无谓的属性监听 */
  transition: box-shadow 0.25s ease;
}

.type-selector-item:hover {
  background: linear-gradient(180deg, rgba(var(--ai-accent-rgb), 0.16), rgba(var(--ai-accent-rgb), 0.1));
  box-shadow: 0 8px 20px -10px rgba(var(--ai-accent-rgb), 0.42);
}

.type-selector-item:focus-within {
  background: linear-gradient(180deg, rgba(var(--ai-accent-rgb), 0.16), rgba(var(--ai-accent-rgb), 0.1));
  box-shadow: 0 0 0 3px rgba(var(--ai-accent-rgb), 0.14);
}

.type-selector-item:has(.ant-select-disabled) {
  opacity: 0.6;
}

.type-selector-label {
  flex-shrink: 0;
  padding-right: 10px;
  margin-right: 4px;
  border-right: 1px solid rgba(var(--ai-accent-rgb), 0.18);
  color: var(--ai-muted);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* 模型下拉推到这一行的最右侧 */
.type-selector-item:last-child {
  margin-left: auto;
}

.type-select {
  width: 150px;
}

/* 模型名通常更长，单独加宽 */
.type-select--model {
  width: 186px;
}

/* 下拉本体融进胶囊：去掉自身底色、边框与阴影 */
.type-selector-item :deep(.type-select) {
  height: 30px !important;
  line-height: 30px !important;
}

.type-selector-item :deep(.type-select .ant-select-selector) {
  display: flex !important;
  align-items: center !important;
  /* 值在框内水平居中（右侧留出箭头的位置，使视觉重心居中） */
  justify-content: center !important;
  height: 30px !important;
  padding: 0 20px 0 0 !important;
  overflow: hidden !important;
  background: transparent !important;
  border: none !important;
  border-radius: 999px !important;
  box-shadow: none !important;
}

/* 交互态必须单独覆盖：全局 .ant-select-focused ... .ant-select-selector 的特异性为 5，
   高于上面的 base 规则(4)，不覆盖就会在胶囊内部画出一个"框中框"聚焦环。 */
.type-selector-item.type-selector-item :deep(.type-select .ant-select-selector:hover),
.type-selector-item.type-selector-item :deep(.type-select:hover .ant-select-selector),
.type-selector-item.type-selector-item :deep(.type-select.ant-select-focused .ant-select-selector),
.type-selector-item.type-selector-item :deep(.type-select.ant-select-open .ant-select-selector) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 值 / 占位符：显式 flex 垂直居中，避免 small 尺寸下的基线偏移 */
.type-selector-item :deep(.type-select .ant-select-selection-item),
.type-selector-item :deep(.type-select .ant-select-selection-placeholder) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 0 !important;
  height: 30px !important;
  line-height: 1 !important;
  font-size: 13px;
}

/* antd 给值元素塞了一个 ::after 基线伪元素，会撑高行盒把文字顶偏，这里关掉 */
.type-selector-item :deep(.type-select .ant-select-selection-item::after),
.type-selector-item :deep(.type-select .ant-select-selection-placeholder::after) {
  display: none !important;
}

.type-selector-item :deep(.type-select .ant-select-selection-search-input) {
  line-height: 30px !important;
  font-size: 13px;
}

.type-selector-item :deep(.type-select .ant-select-selection-item),
.type-selector-item :deep(.type-select .ant-select-selection-search-input) {
  color: var(--ai-title) !important;
  font-weight: 600;
}

.type-selector-item :deep(.type-select .ant-select-selection-placeholder) {
  color: var(--ai-muted) !important;
}

.type-selector-item :deep(.type-select .ant-select-arrow) {
  inset-inline-end: 2px;
  color: rgba(var(--ai-accent-rgb), 0.85) !important;
  font-size: 11px;
}

.type-selector-item :deep(.type-select.ant-select-disabled .ant-select-selection-item) {
  color: var(--ai-muted) !important;
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
  border: 1px solid var(--ai-border-soft);
  border-radius: 14px;
  background: rgba(var(--ai-ink-rgb), 0.025);
  text-align: center;
}

.empty-illustration {
  width: 160px;
  max-width: 100%;
  margin-bottom: 14px;
  opacity: 0.55;
}

.illu-window {
  fill: rgba(var(--ai-ink-rgb), 0.02);
  stroke: rgba(var(--ai-accent-rgb), 0.32);
  stroke-width: 1.5;
}

.illu-accent {
  fill: rgba(var(--ai-accent-rgb), 0.38);
}

.illu-card {
  fill: rgba(255, 255, 255, 0.6);
  stroke: rgba(var(--ai-ink-rgb), 0.12);
  stroke-width: 1;
}

.illu-bar {
  fill: rgba(var(--ai-ink-rgb), 0.18);
}

.illu-cursor {
  fill: #d9a05b;
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
    min-height: 120px;
  }

  .upload-chip-name {
    max-width: 170px;
  }
}

/* =====================================================================
   纸雕主题 · 温柔纸雕 / 淡黄纸片（首页样板）
   作用域仅限 #homePage，不影响其它页面；要回退直接删掉本段即可。
   设计原则：结构规整，材质有手感 —— 只换色彩 / 材质 / 边缘 / 插画。
   ===================================================================== */
/* 背景与纸料色板已在 App.vue 全局定义（全站纸雕主题） */

/* 纸雕不需要发光层 */
#homePage::after {
  display: none;
}

/* ───────── 剪纸小狐狸（贴在生成框右上角） ───────── */
.paper-fox {
  position: absolute;
  top: -20px;
  right: -10px;
  width: 68px;
  height: 68px;
  transform: rotate(-8deg);
  filter: drop-shadow(2px 3px 0 rgba(184, 152, 104, 0.32));
  pointer-events: none;
  z-index: 3;
}

/* ───────── 生成框 = 一张贴上去的白纸 ───────── */
#homePage .generator-panel {
  background: #fffdf7;
  border: 1.5px solid #ecdcbd;
  border-radius: 18px;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.26), 0 22px 30px -26px rgba(120, 92, 52, 0.6);
}

#homePage .generator-panel::before {
  left: 10%;
  right: 10%;
  background: linear-gradient(90deg, transparent, rgba(201, 113, 62, 0.32), transparent);
}

/* ───────── 输入区 = 纸上压出的凹槽 ───────── */
#homePage :deep(.prompt-input.ant-input) {
  background: #faf3e3;
  border: 1.5px solid #ecdcbd;
  border-radius: 14px;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: inset 2px 2px 0 rgba(184, 152, 104, 0.12);
  color: var(--ai-title);
}

#homePage :deep(.prompt-input.ant-input:hover) {
  background: #fdf7ea;
}

#homePage :deep(.prompt-input.ant-input:focus),
#homePage :deep(.prompt-input.ant-input-focused) {
  background: #fffdf7;
  border-color: #d9a878;
  box-shadow: inset 2px 2px 0 rgba(184, 152, 104, 0.1), 0 0 0 3px rgba(201, 113, 62, 0.14);
}

#homePage :deep(.prompt-input.ant-input::placeholder) {
  font-style: normal;
}

/* ───────── 生成按钮 = 陶土橘纸片圆片 ───────── */
#homePage .generate-button {
  background: #c9713e;
  background-image: none;
  color: #fffdf7;
  box-shadow: 2px 3px 0 rgba(150, 92, 48, 0.36);
}

#homePage .generate-button:hover {
  background: #b9622f;
  box-shadow: 3px 4px 0 rgba(150, 92, 48, 0.42);
  transform: translateY(-1px) scale(1.03);
}

#homePage .generate-button:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: 1px 1px 0 rgba(150, 92, 48, 0.36);
}

/* 呼吸动画是蓝色 box-shadow，纸雕下关掉 */
#homePage .input-shell.is-creating .generate-button {
  animation: none;
}

/* ───────── 纸片 chip（徽标 / 上传 / Skills / 模板） ───────── */
#homePage .hero-badge {
  background: rgba(201, 113, 62, 0.1);
  border: 1.5px solid rgba(201, 113, 62, 0.22);
  border-radius: 10px;
  color: #a8612f;
}

#homePage .upload-trigger,
#homePage .skills-trigger {
  background: #fffdf7;
  border: 1.5px solid #ecdcbd;
  border-radius: 10px;
  color: var(--ai-title);
  box-shadow: 2px 2px 0 rgba(184, 152, 104, 0.18);
}

#homePage .upload-trigger:hover,
#homePage .skills-trigger:hover {
  background: #fdf6e6;
  border-color: #dcc9a2;
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.26);
}

#homePage .template-chip {
  background: #fffdf7;
  border: 1.5px solid #ecdcbd;
  border-radius: 10px;
  box-shadow: 1px 1px 0 rgba(184, 152, 104, 0.14);
}

#homePage .template-chip:hover {
  background: #fdf6e6;
  border-color: #dcc9a2;
  color: var(--ai-title);
  box-shadow: 2px 2px 0 rgba(184, 152, 104, 0.22);
}

#homePage .template-chip.is-active {
  background: rgba(201, 113, 62, 0.12);
  border-color: rgba(201, 113, 62, 0.3);
  color: #a8612f;
  box-shadow: 1px 1px 0 rgba(184, 152, 104, 0.2);
}

/* ───────── 生成类型 / 模型胶囊 = 纸片 ───────── */
#homePage .type-selector-item {
  background: #f6ead1;
  border: none;
  box-shadow: none;
}

#homePage .type-selector-item:hover {
  background: #f0e0bf;
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.22);
}

#homePage .type-selector-item:focus-within {
  background: #f0e0bf;
  box-shadow: 0 0 0 3px rgba(201, 113, 62, 0.16);
}

#homePage .type-selector-label {
  border-right-color: rgba(168, 138, 92, 0.4);
  color: #8d7c60;
}

/* ───────── 空状态也要纸片化 ───────── */
#homePage .empty-state {
  background: #fffdf7;
  border: 1.5px dashed #e3d2b0;
  border-radius: 16px;
}

@media (max-width: 860px) {
  .paper-fox {
    display: none;
  }
}
</style>
