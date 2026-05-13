<template>
  <div id="statisticsPage">
    <div class="page-header">
      <h2 class="page-title">数据统计</h2>
      <a-button @click="fetchData" :loading="loading">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(79, 124, 255, 0.12); color: #5f8cff">
            <CalendarOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.todayCount ?? '-' }}</div>
            <div class="stat-label">今日创作</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0, 201, 167, 0.12); color: #00c9a7">
            <ClockCircleOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.weekCount ?? '-' }}</div>
            <div class="stat-label">本周创作</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(255, 184, 0, 0.12); color: #ffb800">
            <FileTextOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.monthCount ?? '-' }}</div>
            <div class="stat-label">本月创作</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(114, 46, 209, 0.12); color: #722ed1">
            <FolderOpenOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.totalCount ?? '-' }}</div>
            <div class="stat-label">总创作</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" style="margin-top: 16px">
      <a-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(82, 196, 26, 0.12); color: #52c41a">
            <CheckCircleOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.successRate != null ? stats.successRate.toFixed(1) + '%' : '-' }}</div>
            <div class="stat-label">生成成功率</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(255, 121, 97, 0.12); color: #ff7961">
            <HourglassOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.avgDurationMs != null ? (stats.avgDurationMs / 1000).toFixed(1) + 's' : '-' }}</div>
            <div class="stat-label">平均耗时</div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(47, 128, 237, 0.12); color: #2f80ed">
            <TeamOutlined />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.activeUserCount ?? '-' }}<span class="stat-sub"> / {{ stats.totalUserCount ?? '-' }}</span></div>
            <div class="stat-label">活跃用户 / 总用户</div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { getStatistics } from '@/api/statisticsController.ts'
import {
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue'

const stats = reactive<API.StatisticsVO>({})
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getStatistics()
    if (res.data.code === 0 && res.data.data) {
      Object.assign(stats, res.data.data)
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
#statisticsPage {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(21, 23, 32, 0.6);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  border-color: rgba(255, 255, 255, 0.08);
}

.stat-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  font-size: 22px;
}

.stat-body {
  min-width: 0;
}

.stat-value {
  color: var(--ai-title);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stat-sub {
  font-size: 16px;
  font-weight: 400;
  color: var(--ai-muted);
}

.stat-label {
  margin-top: 4px;
  color: var(--ai-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.01em;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 22px;
  }
}
</style>
