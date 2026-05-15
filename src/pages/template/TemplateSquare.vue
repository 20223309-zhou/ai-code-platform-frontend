<template>
  <div id="templateSquarePage">
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">模板广场</h1>
        <p class="page-desc">选择模板开始你的应用构建</p>
      </div>
    </div>

    <div class="category-tabs">
      <a-tabs v-model:activeKey="activeCategory" @change="onCategoryChange">
        <a-tab-pane key="" tab="全部" />
        <a-tab-pane key="blog" tab="个人博客" />
        <a-tab-pane key="corporate" tab="企业官网" />
        <a-tab-pane key="mall" tab="在线商城" />
        <a-tab-pane key="portfolio" tab="作品集" />
        <a-tab-pane key="tool" tab="工具" />
        <a-tab-pane key="dashboard" tab="仪表盘" />
        <a-tab-pane key="admin" tab="管理后台" />
        <a-tab-pane key="landing" tab="落地页" />
      </a-tabs>
    </div>

    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>

    <template v-else>
      <div v-if="templates.length === 0" class="empty-state">
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
        </svg>
        <h3 class="empty-title">暂无模板</h3>
        <p class="empty-desc">管理员尚未发布模板，请稍后再来看看。</p>
      </div>

      <div v-else class="template-grid">
        <div v-for="app in templates" :key="app.id" class="template-card">
          <div class="card-preview" @click="openPreview(app)" title="在线浏览">
            <img v-if="app.cover" :src="app.cover" class="card-cover" alt="" />
            <div v-else class="card-placeholder">
              <svg viewBox="0 0 320 140" class="placeholder-illustration" aria-hidden="true">
                <rect x="22" y="20" width="276" height="100" rx="18" class="line panel" />
                <rect x="40" y="38" width="64" height="10" rx="5" class="line soft" />
                <rect x="40" y="58" width="112" height="8" rx="4" class="line soft" />
                <rect x="40" y="76" width="86" height="8" rx="4" class="line soft" />
                <rect x="182" y="40" width="92" height="56" rx="14" class="line accent" />
                <path d="M 196 88 C 214 60, 242 62, 258 48" class="line accent" />
                <circle cx="208" cy="54" r="6" class="dot" />
                <circle cx="236" cy="70" r="6" class="dot" />
                <circle cx="256" cy="50" r="6" class="dot" />
              </svg>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ app.appName }}</h3>
            <div class="card-meta">
              <UserInfo v-if="app.user" :user="app.user" size="small" />
              <a-tag color="blue">{{ formatCodeGenType(app.codeGenType) }}</a-tag>
            </div>
          </div>
          <div class="card-footer">
            <a-space style="width: 100%">
              <a-button type="primary" @click="forkTemplate(app)" :loading="forkingId === app.id" style="flex: 1">
                使用模板
              </a-button>
              <a-button @click="openPreview(app)">
                在线浏览
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <div v-if="pagination.total > pagination.pageSize" class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-size-changer="false"
          :show-total="(total: number) => `共 ${total} 个模板`"
          @change="loadTemplates"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { listGoodAppVoByPage, forkTemplate as forkTemplateApi } from '@/api/appController'
import { formatCodeGenType } from '@/utils/codeGenTypes'
import { getStaticPreviewUrl } from '@/config/env'
import UserInfo from '@/components/UserInfo.vue'

const router = useRouter()

const templates = ref<API.AppVO[]>([])
const loading = ref(false)
const forkingId = ref<string | number | null>(null)
const activeCategory = ref('')

const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0,
})

const loadTemplates = async () => {
  loading.value = true
  try {
    const params: API.AppQueryRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    }
    if (activeCategory.value) {
      params.category = activeCategory.value
    }
    const res = await listGoodAppVoByPage(params)
    if (res.data.code === 0 && res.data.data) {
      templates.value = res.data.data.records || []
      pagination.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载模板失败：', error)
  } finally {
    loading.value = false
  }
}

const onCategoryChange = () => {
  pagination.current = 1
  loadTemplates()
}

const getStaticUrl = (app: API.AppVO) => {
  if (app.codeGenType && app.id) {
    return getStaticPreviewUrl(app.codeGenType, String(app.id))
  }
  return ''
}

const openPreview = (app: API.AppVO) => {
  const url = getStaticUrl(app)
  if (url) {
    window.open(url, '_blank')
  }
}

const forkTemplate = async (app: API.AppVO) => {
  if (!app.id) return
  forkingId.value = app.id
  try {
    const res = await forkTemplateApi({ templateId: String(app.id) })
    if (res.data.code === 0 && res.data.data) {
      message.success('模板使用成功，正在跳转...')
      router.push(`/app/chat/${res.data.data}?view=1`)
    } else {
      message.error(res.data.message || '使用模板失败')
    }
  } catch (error) {
    console.error('使用模板失败：', error)
    message.error('使用模板失败')
  } finally {
    forkingId.value = null
  }
}

onMounted(loadTemplates)
</script>

<style scoped>
#templateSquarePage {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header-text {
  max-width: 600px;
}

.page-title {
  margin: 0 0 8px;
  color: var(--ai-title);
  font-size: 26px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  color: var(--ai-muted);
  font-size: 14px;
  line-height: 1.6;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-card-radius);
  background: rgba(255, 255, 255, 0.015);
  text-align: center;
}

.empty-illustration {
  width: 140px;
  margin-bottom: 14px;
  opacity: 0.4;
}

.illu-window { fill: rgba(255, 255, 255, 0.015); stroke: rgba(79, 124, 255, 0.2); stroke-width: 1.5; }
.illu-accent { fill: rgba(79, 124, 255, 0.3); }
.illu-card { fill: rgba(255, 255, 255, 0.02); stroke: rgba(255, 255, 255, 0.06); stroke-width: 1; }
.illu-bar { fill: rgba(255, 255, 255, 0.08); }

.empty-title {
  margin: 4px 0 8px;
  color: var(--ai-title);
  font-size: 17px;
  font-weight: 500;
}

.empty-desc {
  max-width: 380px;
  margin: 0;
  color: var(--ai-muted);
  font-size: 14px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.template-card {
  display: flex;
  flex-direction: column;
  background: var(--ai-surface);
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-card-radius);
  overflow: hidden;
  transition: var(--ai-transition);
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ai-shadow-hover);
}

.card-preview {
  position: relative;
  width: 100%;
  height: 200px;
  background: rgba(79, 124, 255, 0.03);
  overflow: hidden;
  cursor: pointer;
}

.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.placeholder-illustration {
  width: calc(100% - 24px);
  height: calc(100% - 18px);
}

.line {
  fill: none;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.panel {
  stroke: rgba(79, 124, 255, 0.12);
  fill: rgba(255, 255, 255, 0.02);
}

.soft {
  stroke: rgba(255, 255, 255, 0.1);
}

.accent {
  stroke: rgba(79, 124, 255, 0.4);
}

.dot {
  fill: rgba(125, 211, 252, 0.55);
}

.card-body {
  flex: 1;
  padding: 14px 16px 0;
}

.card-title {
  margin: 0 0 8px;
  color: var(--ai-title);
  font-size: 16px;
  font-weight: 600;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-footer {
  padding: 12px 16px 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  color: var(--ai-muted);
  font-size: 14px;
}

:deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--ai-primary) !important;
  font-weight: 500;
}

:deep(.ant-tabs-ink-bar) {
  background: var(--ai-primary);
}

:deep(.ant-tabs) {
  color: var(--ai-text);
}
</style>
