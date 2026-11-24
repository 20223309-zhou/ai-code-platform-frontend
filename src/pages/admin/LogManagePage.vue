<template>
  <div id="logManagePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.username" placeholder="输入用户名" allow-clear />
      </a-form-item>
      <a-form-item label="状态">
        <a-select v-model:value="searchParams.status" placeholder="选择状态" allow-clear style="width: 120px">
          <a-select-option value="SUCCESS">成功</a-select-option>
          <a-select-option value="FAILED">失败</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="请求方式">
        <a-select v-model:value="searchParams.requestMethod" placeholder="选择方式" allow-clear style="width: 120px">
          <a-select-option value="GET">GET</a-select-option>
          <a-select-option value="POST">POST</a-select-option>
          <a-select-option value="PUT">PUT</a-select-option>
          <a-select-option value="DELETE">DELETE</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
        <a-button style="margin-left: 8px" @click="doReset">重置</a-button>
      </a-form-item>
    </a-form>

    <div class="table-toolbar">
      <a-button danger :disabled="selectedRowIds.length === 0" @click="doBatchDelete">
        批量删除 ({{ selectedRowIds.length }})
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      @change="doTableChange"
      :scroll="{ x: 1250 }"
      :row-selection="{ selectedRowKeys: selectedRowIds, onChange: onSelectionChange }"
      row-key="id"
      size="small"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'requestMethod'">
          <span :class="['method-tag', 'method-' + (record.requestMethod || '').toLowerCase()]">{{ record.requestMethod }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <span :class="['status-tag', record.status === 'SUCCESS' ? 'status-success' : 'status-fail']">{{ record.status === 'SUCCESS' ? '成功' : '失败' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'username'">
          <div class="user-cell">
            <span class="user-name">{{ record.username || '未知用户' }}</span>
            <span class="user-id">ID {{ record.userId ?? '-' }}</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ formatTime(record.createTime) }}
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a-tooltip :title="record.operation">
            <span class="ellipsis-text">{{ record.operation || '-' }}</span>
          </a-tooltip>
        </template>
        <template v-else-if="column.dataIndex === 'modelName'">
          <span v-if="record.modelName">{{ record.modelName }}</span>
          <span v-else>-</span>
          <!-- 中断时只有前面各轮的用量，标出来避免被当成完整值 -->
          <a-tag v-if="record.usagePartial" color="orange" class="partial-tag">部分</a-tag>
        </template>
        <template v-else-if="column.key === 'token'">
          <div class="token-cell">
            <span class="token-total">{{ formatNumber(record.totalTokens) }}</span>
            <span class="token-sub">入 {{ formatNumber(record.inputTokens) }} / 出 {{ formatNumber(record.outputTokens) }}</span>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'modelRounds'">
          <!-- 轮次多通常意味着反复构建/修复，标出来便于一眼看出异常 -->
          <a-tag v-if="record.modelRounds && record.modelRounds >= 8" color="orange">
            {{ record.modelRounds }}
          </a-tag>
          <span v-else>{{ record.modelRounds ?? '-' }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" size="small" @click="openDetail(record)">详情</a-button>
          <a-popconfirm title="确定删除此条日志？" @confirm="doDelete(record.id)">
            <a-button type="link" danger size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <a-drawer v-model:open="detailOpen" title="日志详情" placement="right" :width="560">
      <template v-if="currentLog">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="日志 ID">{{ currentLog.id ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="操作时间">{{ formatTime(currentLog.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="用户">
            {{ currentLog.username || '-' }}
            <span class="detail-muted">（ID {{ currentLog.userId ?? '-' }}）</span>
          </a-descriptions-item>
          <a-descriptions-item label="应用 ID">{{ currentLog.appId ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="请求">
            <span class="detail-muted">{{ currentLog.requestMethod }}</span>
            {{ currentLog.requestUri || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="方法名">{{ currentLog.methodName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="IP 地址">{{ currentLog.ipAddress || '-' }}</a-descriptions-item>
          <a-descriptions-item label="操作说明">{{ currentLog.operation || '-' }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <span :class="['status-tag', currentLog.status === 'SUCCESS' ? 'status-success' : 'status-fail']">
              {{ currentLog.status === 'SUCCESS' ? '成功' : '失败' }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="耗时">
            {{ currentLog.durationMs == null ? '-' : currentLog.durationMs + ' ms' }}
          </a-descriptions-item>
          <a-descriptions-item label="开始时间">{{ formatTime(currentLog.startTime) }}</a-descriptions-item>
          <a-descriptions-item label="结束时间">{{ formatTime(currentLog.endTime) }}</a-descriptions-item>
          <a-descriptions-item label="模型">{{ currentLog.modelName || '-' }}</a-descriptions-item>
          <a-descriptions-item label="Token 用量">
            <template v-if="currentLog.totalTokens != null">
              <div class="detail-token">
                <span>输入 {{ formatNumber(currentLog.inputTokens) }}</span>
                <span>输出 {{ formatNumber(currentLog.outputTokens) }}</span>
                <span>合计 {{ formatNumber(currentLog.totalTokens) }}</span>
              </div>
              <a-tag v-if="currentLog.usagePartial" color="orange">中断，仅统计已完成的轮次</a-tag>
            </template>
            <span v-else class="detail-muted">本接口不涉及 AI 调用</span>
          </a-descriptions-item>
          <a-descriptions-item label="模型调用轮次">
            {{ currentLog.modelRounds ?? '-' }}
            <span v-if="currentLog.modelRounds && currentLog.modelRounds > 1" class="detail-muted">
              （含 {{ currentLog.modelRounds - 1 }} 轮工具调用）
            </span>
          </a-descriptions-item>
        </a-descriptions>

        <div class="params-block">
          <div class="params-title">请求参数</div>
          <pre v-if="prettyParams" class="params-pre">{{ prettyParams }}</pre>
          <span v-else class="detail-muted">无</span>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { listOperationLog, deleteOperationLog } from '@/api/operationLogController.ts'
import dayjs from 'dayjs'

/**
 * 表格只保留"扫一眼"必需的列；IP、方法名、请求参数等移到详情抽屉。
 * 列宽之和必须 ≤ scroll.x，否则固定列会压在内容上（之前出过重叠）。
 */
const columns = [
  { title: '操作时间', dataIndex: 'createTime', width: 175 },
  { title: '用户', dataIndex: 'username', width: 150 },
  { title: '请求方式', dataIndex: 'requestMethod', width: 95 },
  { title: '操作说明', dataIndex: 'operation', width: 220, ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 85 },
  { title: '模型', dataIndex: 'modelName', width: 150, ellipsis: true },
  { title: 'Token', key: 'token', width: 150 },
  { title: '轮次', dataIndex: 'modelRounds', width: 75 },
  { title: '操作', key: 'action', width: 110, fixed: 'right' },
]

const data = ref<API.SysOperationLog[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRowIds = ref<string[]>([])

const detailOpen = ref(false)
const currentLog = ref<API.SysOperationLog | null>(null)

const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: undefined as string | undefined,
  status: undefined as string | undefined,
  requestMethod: undefined as string | undefined,
})

const formatTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-')

const formatNumber = (value?: number) => (value == null ? '-' : value.toLocaleString())

const openDetail = (record: API.SysOperationLog) => {
  currentLog.value = record
  detailOpen.value = true
}

/** 请求参数是一段 JSON 字符串，格式化后更好读；解析失败就原样展示 */
const prettyParams = computed(() => {
  const raw = currentLog.value?.requestParams
  if (!raw) return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await listOperationLog({ ...searchParams })
    if (res.data.code === 0 && res.data.data) {
      data.value = res.data.data.records ?? []
      total.value = res.data.data.totalRow ?? 0
    } else {
      message.error('获取日志失败，' + (res.data.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

const pagination = computed(() => ({
  current: searchParams.pageNum,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
}))

const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.pageNum = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.pageNum = 1
  fetchData()
}

const doReset = () => {
  searchParams.username = undefined
  searchParams.status = undefined
  searchParams.requestMethod = undefined
  searchParams.pageNum = 1
  fetchData()
}

const onSelectionChange = (keys: string[]) => {
  selectedRowIds.value = keys
}

const doDelete = async (id?: string) => {
  if (!id) return
  const res = await deleteOperationLog({ ids: [id] })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 删掉的正好是抽屉里那条时顺手关掉，避免看到已删除的数据
    if (currentLog.value?.id === id) detailOpen.value = false
    fetchData()
  } else {
    message.error('删除失败，' + (res.data.message || '未知错误'))
  }
}

const doBatchDelete = async () => {
  if (selectedRowIds.value.length === 0) return
  const res = await deleteOperationLog({ ids: selectedRowIds.value })
  if (res.data.code === 0) {
    message.success('批量删除成功')
    selectedRowIds.value = []
    fetchData()
  } else {
    message.error('批量删除失败，' + (res.data.message || '未知错误'))
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#logManagePage {
  padding: 24px;
  background: var(--ai-card-surface-solid);
  border: 1px solid var(--ai-card-border);
  border-radius: 16px;
  margin-top: 16px;
  box-shadow: var(--ai-card-shadow);
}

#logManagePage :deep(.ant-form-item-label > label) {
  color: var(--ai-text);
}

.table-toolbar {
  margin: 12px 0;
}

/* 用户列：用户名 + ID 两行 */
.user-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  color: var(--ai-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-id {
  font-size: 12px;
  color: var(--ai-muted);
}

/* Token 列：合计 + 入/出 */
.token-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.token-total {
  font-size: 13px;
  color: var(--ai-title);
  font-variant-numeric: tabular-nums;
}

.token-sub {
  font-size: 12px;
  color: var(--ai-muted);
}

.partial-tag {
  margin-left: 6px;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

/* 详情抽屉 */
.detail-muted {
  color: var(--ai-muted);
}

.detail-token {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}

.params-block {
  margin-top: 20px;
}

.params-title {
  font-size: 13px;
  color: var(--ai-title);
  margin-bottom: 8px;
}

.params-pre {
  margin: 0;
  padding: 12px;
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--ai-bg-subtle, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--ai-card-border);
  border-radius: 8px;
  color: var(--ai-text);
}

/* 自定义方法标签 */
.method-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.method-get {
  color: var(--ai-primary);
  background: rgba(var(--ai-accent-rgb), 0.08);
  border-color: rgba(var(--ai-accent-rgb), 0.15);
}
.method-post {
  color: #34d399;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.15);
}
.method-put {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.15);
}
.method-delete {
  color: #f87171;
  background: rgba(248, 113, 113, 0.08);
  border-color: rgba(248, 113, 113, 0.15);
}

/* 自定义状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.status-success {
  color: #34d399;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.15);
}
.status-fail {
  color: #f87171;
  background: rgba(248, 113, 113, 0.08);
  border-color: rgba(248, 113, 113, 0.15);
}
</style>
