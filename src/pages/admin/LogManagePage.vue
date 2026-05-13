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
      :scroll="{ x: 1200 }"
      :row-selection="{ selectedRowKeys: selectedRowIds, onChange: onSelectionChange }"
      row-key="id"
      size="small"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'requestMethod'">
          <a-tag :color="methodColor(record.requestMethod)">{{ record.requestMethod }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="record.status === 'SUCCESS' ? 'green' : 'red'">{{ record.status === 'SUCCESS' ? '成功' : '失败' }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'durationMs'">
          <span>{{ record.durationMs ?? '-' }} ms</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-popconfirm title="确定删除此条日志？" @confirm="doDelete(record.id)">
            <a-button type="link" danger size="small">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { listOperationLog, deleteOperationLog } from '@/api/operationLogController.ts'
import dayjs from 'dayjs'

const columns = [
  {
    title: '序号',
    key: 'index',
    width: 70,
    customRender: ({ index }: { index: number }) =>
      ((searchParams.pageNum ?? 1) - 1) * (searchParams.pageSize ?? 10) + index + 1,
  },
  { title: '用户ID', dataIndex: 'userId', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: 'IP地址', dataIndex: 'ipAddress', width: 140 },
  { title: '请求方式', dataIndex: 'requestMethod', width: 100 },
  { title: '操作说明', dataIndex: 'operation', width: 200, ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '方法名', dataIndex: 'methodName', width: 200, ellipsis: true },
  { title: '操作时间', dataIndex: 'createTime', width: 180 },
  { title: '操作耗时', dataIndex: 'durationMs', width: 100 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
]

const data = ref<API.SysOperationLog[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRowIds = ref<number[]>([])

const searchParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: undefined as string | undefined,
  status: undefined as string | undefined,
  requestMethod: undefined as string | undefined,
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

const onSelectionChange = (keys: number[]) => {
  selectedRowIds.value = keys
}

const doDelete = async (id?: number) => {
  if (!id) return
  const res = await deleteOperationLog({ ids: [id] })
  if (res.data.code === 0) {
    message.success('删除成功')
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

const methodColor = (method?: string) => {
  const map: Record<string, string> = {
    GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red',
  }
  return map[method ?? ''] || 'default'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#logManagePage {
  padding: 24px;
  background: var(--ai-surface);
  border: 1px solid var(--ai-glass-border);
  border-radius: 16px;
  margin-top: 16px;
}

#logManagePage :deep(.ant-form-item-label > label) {
  color: var(--ai-text);
}

.table-toolbar {
  margin: 12px 0;
}

</style>
