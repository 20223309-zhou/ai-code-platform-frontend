<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'
import AppCard from '@/components/AppCard.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()
let handleMouseMove: ((e: MouseEvent) => void) | null = null

const userPrompt = ref('')
const creating = ref(false)
const activeTemplate = ref('')

const myApps = ref<API.AppVO[]>([])
const myAppsPage = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const featuredApps = ref<API.AppVO[]>([])
const featuredAppsPage = reactive({
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

const setPrompt = (prompt: string, label: string) => {
  userPrompt.value = prompt
  activeTemplate.value = label
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

const loadFeaturedApps = async () => {
  try {
    const res = await listGoodAppVoByPage({
      pageNum: featuredAppsPage.current,
      pageSize: featuredAppsPage.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredAppsPage.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载精选应用失败：', error)
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
  loadFeaturedApps()

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
        <h1 class="hero-title">AI零代码应用生成平台</h1>
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
          <svg viewBox="0 0 240 180" class="empty-robot" aria-hidden="true">
            <rect x="74" y="42" width="92" height="72" rx="20" class="robot-line robot-body" />
            <circle cx="103" cy="78" r="7" class="robot-line" />
            <circle cx="137" cy="78" r="7" class="robot-line" />
            <path d="M96 96 C108 108, 132 108, 144 96" class="robot-line" />
            <path d="M120 20 L120 42" class="robot-line" />
            <circle cx="120" cy="16" r="8" class="robot-core" />
            <path d="M52 58 L74 68" class="robot-line" />
            <path d="M188 58 L166 68" class="robot-line" />
            <path d="M90 114 L78 138" class="robot-line" />
            <path d="M150 114 L162 138" class="robot-line" />
            <path d="M28 138 C58 102, 64 102, 88 138" class="circuit-line" />
            <path d="M152 138 C176 102, 182 102, 212 138" class="circuit-line" />
            <circle cx="28" cy="138" r="4" class="circuit-dot" />
            <circle cx="88" cy="138" r="4" class="circuit-dot" />
            <circle cx="152" cy="138" r="4" class="circuit-dot" />
            <circle cx="212" cy="138" r="4" class="circuit-dot" />
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

      <section class="section fade-section is-visible">
        <div class="section-heading">
          <h2 class="section-title">精选案例</h2>
          <p class="section-desc">聚焦更完整的 AI 生成体验，展示具有代表性的应用样例。</p>
        </div>

        <div class="featured-grid">
          <AppCard
            v-for="app in featuredApps"
            :key="app.id"
            :app="app"
            :featured="true"
            @view-chat="viewChat"
            @view-work="viewWork"
          />
        </div>

        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="featuredAppsPage.current"
            v-model:page-size="featuredAppsPage.pageSize"
            :total="featuredAppsPage.total"
            :show-size-changer="false"
            :show-total="(total: number) => `共 ${total} 个案例`"
            @change="loadFeaturedApps"
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
  background:
    radial-gradient(circle at top left, rgba(67, 97, 238, 0.1), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(0, 245, 212, 0.12), transparent 20%),
    linear-gradient(180deg, #f8fafc 0%, #f3f7ff 45%, #f8fafc 100%);
}

#homePage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(67, 97, 238, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(67, 97, 238, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 88%);
  pointer-events: none;
}

#homePage::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    520px circle at var(--mouse-x, 50%) var(--mouse-y, 18%),
    rgba(67, 97, 238, 0.12),
    transparent 72%
  );
  pointer-events: none;
}

.page-shell {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 44px 20px 56px;
}

.fade-section {
  opacity: 0;
  transform: translateY(18px);
}

.fade-section.is-visible {
  animation: fade-up 0.7s ease forwards;
}

.hero-section {
  padding: 32px 0 28px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border: 1px solid rgba(67, 97, 238, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: var(--ai-shadow);
  color: var(--ai-primary);
  font-size: 13px;
  font-weight: 700;
}

.hero-title {
  margin: 18px 0 12px;
  color: var(--ai-title);
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.hero-description {
  max-width: 620px;
  margin: 0 auto;
  color: var(--ai-text);
  font-size: 18px;
}

.generator-panel {
  max-width: 860px;
  margin: 0 auto 56px;
  padding: 32px;
  border: 1px solid rgba(226, 232, 240, 0.85);
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f5ff 100%);
  box-shadow: 0 20px 60px rgba(67, 97, 238, 0.08);
}

.generator-header {
  margin-bottom: 18px;
}

.panel-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 24px;
  font-weight: 700;
}

.panel-subtitle {
  margin: 8px 0 0;
  color: var(--ai-text);
  font-size: 14px;
}

.input-shell {
  position: relative;
  margin-bottom: 18px;
}

:deep(.prompt-input.ant-input) {
  min-height: 164px;
  padding: 18px 78px 18px 18px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-control-radius);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.08);
  color: var(--ai-title);
  font-size: 15px;
  resize: none;
}

:deep(.prompt-input.ant-input:focus),
:deep(.prompt-input.ant-input-focused) {
  border-color: var(--ai-primary);
  box-shadow:
    inset 0 0 0 3px rgba(67, 97, 238, 0.12),
    0 10px 24px rgba(67, 97, 238, 0.08);
}

:deep(.prompt-input.ant-input::placeholder) {
  color: #94a3b8;
  font-style: italic;
}

.generate-button {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ai-primary), #5f78ff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(67, 97, 238, 0.24);
  cursor: pointer;
  transition: var(--ai-transition);
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(67, 97, 238, 0.28);
}

.generate-button:active {
  transform: scale(0.95);
}

.generate-button:active::after,
.input-shell.is-creating .generate-button::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(0, 245, 212, 0.45);
  animation: pulse-ring 1.2s ease-out infinite;
}

.generate-button:disabled {
  cursor: default;
}

.generate-arrow {
  font-size: 22px;
  line-height: 1;
}

.generate-loader {
  position: relative;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loader-ring {
  width: 32px;
  height: 32px;
  animation: spin-ring 1.1s linear infinite;
}

.loader-ring-track,
.loader-ring-path {
  fill: none;
  stroke-width: 3;
}

.loader-ring-track {
  stroke: rgba(255, 255, 255, 0.22);
}

.loader-ring-path {
  stroke: var(--ai-accent);
  stroke-linecap: round;
  stroke-dasharray: 72;
  stroke-dashoffset: 24;
}

.loader-pulse {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: rgba(0, 245, 212, 0.2);
  filter: blur(6px);
  animation: pulse-ring 1.5s ease-out infinite;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.template-chip {
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: #f8fafc;
  color: var(--ai-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--ai-transition);
}

.template-chip:hover {
  border-color: rgba(67, 97, 238, 0.28);
  color: var(--ai-primary-deep);
  transform: translateY(-1px);
}

.template-chip.is-active {
  background: #e6edff;
  color: var(--ai-primary-deep);
  border-color: rgba(67, 97, 238, 0.24);
  font-weight: 700;
}

.section {
  margin-bottom: 52px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.section-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 32px;
  font-weight: 700;
}

.section-desc {
  margin: 0;
  max-width: 560px;
  color: var(--ai-text);
  font-size: 14px;
  text-align: right;
}

.app-grid,
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 360px));
  justify-content: flex-start;
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 34px 24px;
  border: 1px dashed rgba(67, 97, 238, 0.22);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--ai-shadow);
  text-align: center;
}

.empty-robot {
  width: 240px;
  max-width: 100%;
  margin-bottom: 10px;
}

.robot-line,
.circuit-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.robot-line {
  stroke: rgba(67, 97, 238, 0.92);
  stroke-width: 3;
}

.robot-body {
  fill: rgba(255, 255, 255, 0.82);
}

.robot-core,
.circuit-dot {
  fill: rgba(0, 245, 212, 0.95);
}

.circuit-line {
  stroke: rgba(148, 163, 184, 0.82);
  stroke-width: 2.5;
}

.empty-title {
  margin: 4px 0 8px;
  color: var(--ai-title);
  font-size: 20px;
  font-weight: 700;
}

.empty-desc {
  max-width: 420px;
  margin: 0;
  color: var(--ai-text);
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:deep(.ant-pagination .ant-pagination-item),
:deep(.ant-pagination .ant-pagination-prev),
:deep(.ant-pagination .ant-pagination-next) {
  border-color: var(--ai-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
}

:deep(.ant-pagination .ant-pagination-item-active) {
  border-color: var(--ai-primary);
  background: #f0f5ff;
}

:deep(.ant-pagination .ant-pagination-item-active a) {
  color: var(--ai-primary);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-shell {
    padding: 28px 16px 40px;
  }

  .generator-panel {
    padding: 22px;
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
    font-size: 16px;
  }
}

@media (max-width: 640px) {
  .generator-panel {
    border-radius: 18px;
    max-width: 100%;
  }

  .panel-title {
    font-size: 22px;
  }

  :deep(.prompt-input.ant-input) {
    min-height: 180px;
  }
}
</style>
