<template>
  <div id="statisticsPage">
    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据统计</h2>
        <span class="page-subtitle">系统运行概况一览</span>
      </div>
      <a-button @click="fetchData" :loading="loading" class="refresh-btn">
        <template #icon><ReloadOutlined /></template>
        刷新
      </a-button>
    </div>

    <!-- 顶部 4 个核心指标 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6" v-for="card in topCards" :key="card.key">
        <div class="stat-card" :style="{ '--card-accent': card.color }">
          <div class="stat-icon" :style="{ background: card.iconBg, color: card.color }">
            <component :is="card.icon" />
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ formatNum(stats[card.key]) }}</div>
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-trend-bar">
              <div
                class="stat-trend-fill"
                :style="{ width: trendPercent(card.key), background: card.color }"
              />
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 第二行：趋势图 + 成功率环形 + 耗时与用户 -->
    <a-row :gutter="[16, 16]" style="margin-top: 16px">

      <!-- 创作趋势 SVG 柱状图 -->
      <a-col :xs="24" :lg="12">
        <div class="chart-card">
          <h3 class="chart-title">
            <BarChartOutlined /> 创作趋势
          </h3>
          <div class="chart-body">
            <svg class="bar-chart" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
              <!-- 网格线 -->
              <line v-for="g in gridLines" :key="g.y" x1="48" :y1="g.y" x2="340" :y2="g.y"
                stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="4,4" />
              <!-- 柱子 -->
              <g v-for="(item, idx) in barData" :key="item.key">
                <rect
                  :x="56 + idx * 72" :y="item.y" width="44" :height="item.h"
                  :fill="item.color" rx="6" ry="6"
                  class="bar-rect"
                />
                <text :x="78 + idx * 72" y="185" text-anchor="middle" fill="var(--ai-muted)" font-size="11">
                  {{ item.label }}
                </text>
                <text :x="78 + idx * 72" :y="item.y - 8" text-anchor="middle" fill="var(--ai-title)" font-size="13" font-weight="600">
                  {{ formatNum(stats[item.key]) }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </a-col>

      <!-- 生成质量：成功率环形 -->
      <a-col :xs="12" :lg="6">
        <div class="chart-card">
          <h3 class="chart-title">
            <CheckCircleOutlined /> 生成质量
          </h3>
          <div class="chart-body center">
            <div class="ring-wrapper">
              <svg viewBox="0 0 120 120" class="ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ring-color, #52c41a)"
                  stroke-width="10" stroke-linecap="round"
                  :stroke-dasharray="ringDash" stroke-dashoffset="0"
                  transform="rotate(-90, 60, 60)" class="ring-circle" />
              </svg>
              <div class="ring-label">
                <span class="ring-value">{{ successRateText }}</span>
                <span class="ring-desc">成功率</span>
              </div>
            </div>
            <div class="ring-meta">
              <div class="ring-meta-item">
                <span class="ring-meta-label">平均耗时</span>
                <span class="ring-meta-value">{{ avgDurationText }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-col>

      <!-- 用户活跃度 -->
      <a-col :xs="12" :lg="6">
        <div class="chart-card">
          <h3 class="chart-title">
            <TeamOutlined /> 用户概况
          </h3>
          <div class="chart-body">
            <div class="user-metric">
              <div class="user-row">
                <span class="user-label">活跃用户</span>
                <span class="user-value highlight">{{ formatNum(stats.activeUserCount) }}</span>
              </div>
              <div class="user-row">
                <span class="user-label">总用户</span>
                <span class="user-value">{{ formatNum(stats.totalUserCount) }}</span>
              </div>
              <div class="user-bar-wrap">
                <div class="user-bar">
                  <div class="user-bar-fill" :style="{ width: activeUserPercent }" />
                </div>
                <span class="user-bar-text">{{ activeUserPercent }}</span>
              </div>
              <div class="user-meta">
                <TeamOutlined class="user-meta-icon" />
                <span>活跃率 {{ activeUserPercent }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getStatistics } from '@/api/statisticsController.ts'
import {
  ReloadOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
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

/* ───── 工具函数 ───── */
function formatNum(v: number | null | undefined): string {
  if (v == null) return '-'
  if (v >= 10000) return (v / 10000).toFixed(1) + 'w'
  return v.toLocaleString()
}

/* ───── 顶部卡片 ───── */
const topCards = [
  { key: 'todayCount' as const, label: '今日创作', icon: CalendarOutlined, color: '#5f8cff', iconBg: 'rgba(79,124,255,0.12)' },
  { key: 'weekCount' as const, label: '本周创作', icon: ClockCircleOutlined, color: '#34d399', iconBg: 'rgba(0,201,167,0.12)' },
  { key: 'monthCount' as const, label: '本月创作', icon: FileTextOutlined, color: '#fbbf24', iconBg: 'rgba(255,184,0,0.12)' },
  { key: 'totalCount' as const, label: '总创作', icon: FolderOpenOutlined, color: '#a78bfa', iconBg: 'rgba(114,46,209,0.12)' },
]

const maxCount = computed(() => {
  return Math.max(
    stats.todayCount ?? 0,
    stats.weekCount ?? 0,
    stats.monthCount ?? 0,
    stats.totalCount ?? 1,
  )
})

function trendPercent(key: string): string {
  const v = (stats as any)[key]
  if (v == null || maxCount.value === 0) return '0%'
  return ((v / maxCount.value) * 100).toFixed(1) + '%'
}

/* ───── 柱状图 ───── */
const barColors = ['#5f8cff', '#34d399', '#fbbf24', '#a78bfa']
const barKeys = ['todayCount', 'weekCount', 'monthCount', 'totalCount']
const barLabels = ['今日', '本周', '本月', '总创']

const barMax = computed(() => Math.max(stats.totalCount ?? 1, 1))
const barHeight = 140

const gridLines = computed(() => {
  const lines = []
  for (let i = 0; i <= 4; i++) {
    lines.push({ y: 20 + (i * barHeight) / 4 })
  }
  return lines
})

const barData = computed(() => {
  return barKeys.map((key, idx) => {
    const v = (stats as any)[key] ?? 0
    const ratio = barMax.value > 0 ? v / barMax.value : 0
    const h = Math.max(ratio * barHeight, 2)
    const y = 20 + barHeight - h
    return {
      key,
      label: barLabels[idx],
      color: barColors[idx],
      h,
      y,
    }
  })
})

/* ───── 环形图 ───── */
const successRate = computed(() => stats.successRate ?? 0)
const successRateText = computed(() => {
  return stats.successRate != null ? stats.successRate.toFixed(1) + '%' : '-'
})
const circumference = 2 * Math.PI * 50 // 314.16
const ringDash = computed(() => {
  const pct = Math.min(Math.max(successRate.value / 100, 0), 1)
  return `${pct * circumference} ${circumference - pct * circumference}`
})

const avgDurationText = computed(() => {
  return stats.avgDurationMs != null ? (stats.avgDurationMs / 1000).toFixed(1) + 's' : '-'
})

/* ───── 用户概况 ───── */
const activeUserPercent = computed(() => {
  if (!stats.totalUserCount || stats.totalUserCount === 0) return '0%'
  const pct = ((stats.activeUserCount ?? 0) / stats.totalUserCount) * 100
  return pct.toFixed(1) + '%'
})
</script>

<style scoped>
#statisticsPage {
  padding: 24px;
  animation: fade-up 0.5s ease-out;
}

/* ───── 页头 ───── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.page-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.page-subtitle {
  color: var(--ai-muted);
  font-size: 13px;
}
.refresh-btn {
  border-radius: 8px;
}

/* ───── 统计卡片 ───── */
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
  flex: 1;
  min-width: 0;
}
.stat-value {
  color: var(--ai-title);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.stat-label {
  margin-top: 2px;
  color: var(--ai-muted);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.01em;
}
.stat-trend-bar {
  margin-top: 8px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}
.stat-trend-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ───── 图表卡片 ───── */
.chart-card {
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(21, 23, 32, 0.6);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  height: 100%;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.chart-card:hover {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}
.chart-title {
  margin: 0 0 16px 0;
  color: var(--ai-title);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chart-body {
  position: relative;
}
.chart-body.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ───── SVG 柱状图 ───── */
.bar-chart {
  width: 100%;
  height: 200px;
}
.bar-rect {
  transition: y 0.5s cubic-bezier(0.22, 1, 0.36, 1),
              height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.bar-rect:hover {
  filter: brightness(1.2);
}

/* ───── 环形图 ───── */
.ring-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}
.ring-circle {
  transition: stroke-dasharray 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 8px var(--ring-color, rgba(82, 196, 26, 0.3)));
}
.ring-label {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.ring-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--ai-title);
  line-height: 1.2;
}
.ring-desc {
  font-size: 12px;
  color: var(--ai-muted);
  margin-top: 2px;
}
.ring-meta {
  margin-top: 12px;
  width: 100%;
  text-align: center;
}
.ring-meta-item {
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.ring-meta-label {
  color: var(--ai-muted);
  font-size: 13px;
}
.ring-meta-value {
  color: var(--ai-title);
  font-size: 15px;
  font-weight: 600;
}

/* ───── 用户概况 ───── */
.user-metric {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-label {
  color: var(--ai-muted);
  font-size: 14px;
}
.user-value {
  color: var(--ai-title);
  font-size: 20px;
  font-weight: 700;
}
.user-value.highlight {
  color: #5f8cff;
}
.user-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}
.user-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #5f8cff, #34d399);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.user-bar-text {
  font-size: 13px;
  color: var(--ai-muted);
  font-weight: 500;
  min-width: 44px;
  text-align: right;
}
.user-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--ai-muted);
  font-size: 13px;
}
.user-meta-icon {
  font-size: 14px;
  color: #5f8cff;
}

/* ───── 响应式 ───── */
@media (max-width: 768px) {
  .stat-value {
    font-size: 22px;
  }
  .ring-wrapper {
    width: 110px;
    height: 110px;
  }
  .ring-value {
    font-size: 20px;
  }
}
</style>
