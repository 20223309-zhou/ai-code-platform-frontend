<template>
  <div id="announcementManagePage">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.keyword"
          placeholder="标题或正文"
          allow-clear
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="状态">
        <a-select
          v-model:value="searchParams.status"
          placeholder="全部"
          allow-clear
          style="width: 130px"
        >
          <a-select-option :value="0">草稿</a-select-option>
          <a-select-option :value="1">已发布</a-select-option>
          <a-select-option :value="2">已下线</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
        <a-button style="margin-left: 8px" @click="doReset">重置</a-button>
      </a-form-item>
    </a-form>

    <div class="table-toolbar">
      <a-button type="primary" @click="openCreate">发布公告</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      :scroll="{ x: 1000 }"
      row-key="id"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'title'">
          <div class="cell-title">
            <a-tag v-if="record.topFlag === 1" color="red">置顶</a-tag>
            <span class="title-text">{{ record.title }}</span>
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'level'">
          <a-tag :color="levelColor(record.level)">{{ levelLabel(record.level) }}</a-tag>
        </template>

        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>

        <template v-else-if="column.dataIndex === 'publishTime'">
          {{ formatTime(record.publishTime) || '—' }}
        </template>

        <template v-else-if="column.dataIndex === 'expireTime'">
          {{ formatTime(record.expireTime) || '长期' }}
        </template>

        <template v-else-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
            <a-button
              v-if="record.status !== 1"
              type="link"
              size="small"
              @click="doPublish(record)"
            >
              发布
            </a-button>
            <a-button
              v-if="record.status === 1"
              type="link"
              size="small"
              @click="doOffline(record)"
            >
              下线
            </a-button>
            <a-popconfirm title="确定删除这条公告？" @confirm="doDelete(record)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新建 / 编辑 -->
    <a-modal
      v-model:open="formOpen"
      :title="formState.id ? '编辑公告' : '发布公告'"
      :confirm-loading="submitting"
      width="680px"
      @ok="doSubmit"
    >
      <a-form layout="vertical" :model="formState">
        <a-form-item label="标题" required>
          <a-input v-model:value="formState.title" :maxlength="128" show-count placeholder="例如：10 月 30 日凌晨系统维护" />
        </a-form-item>

        <a-form-item label="正文（支持 Markdown）" required>
          <a-textarea
            v-model:value="formState.content"
            :rows="8"
            placeholder="支持 Markdown：**加粗**、列表、链接、代码块"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="级别">
              <a-select v-model:value="formState.level">
                <a-select-option value="INFO">普通</a-select-option>
                <a-select-option value="WARNING">重要</a-select-option>
                <a-select-option value="SUCCESS">喜报</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="置顶">
              <a-switch
                :checked="formState.topFlag === 1"
                @change="(checked: boolean) => (formState.topFlag = checked ? 1 : 0)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="保存后立即发布">
              <a-switch v-model:checked="formState.publishNow" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="发布时间（留空表示立即）">
              <a-date-picker
                v-model:value="formState.publishTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="过期时间（留空表示长期）">
              <a-date-picker
                v-model:value="formState.expireTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { refreshAnnouncementFeed } from '@/utils/announcementFeed'
import {
  deleteAnnouncement,
  offlineAnnouncement,
  pageAnnouncements,
  publishAnnouncement,
  saveAnnouncement,
  type AnnouncementEntity,
} from '@/api/announcementController'

const data = ref<AnnouncementEntity[]>([])
const searchParams = reactive<{ keyword?: string; status?: number }>({})
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
  showSizeChanger: true,
})

const columns = [
  { title: '标题', dataIndex: 'title', width: 260 },
  { title: '级别', dataIndex: 'level', width: 90 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '发布时间', dataIndex: 'publishTime', width: 170 },
  { title: '过期时间', dataIndex: 'expireTime', width: 170 },
  { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' as const },
]

const formOpen = ref(false)
const submitting = ref(false)
const formState = reactive<{
  id?: number | string
  title: string
  content: string
  level: string
  topFlag: number
  publishNow: boolean
  publishTime?: Dayjs
  expireTime?: Dayjs
}>({
  title: '',
  content: '',
  level: 'INFO',
  topFlag: 0,
  publishNow: true,
  publishTime: undefined,
  expireTime: undefined,
})

const levelLabel = (level?: string) =>
  ({ INFO: '普通', WARNING: '重要', SUCCESS: '喜报' })[level || 'INFO'] || '普通'
const levelColor = (level?: string) =>
  ({ INFO: 'blue', WARNING: 'orange', SUCCESS: 'green' })[level || 'INFO'] || 'blue'
const statusLabel = (status?: number) =>
  ({ 0: '草稿', 1: '已发布', 2: '已下线' })[status ?? 0] || '草稿'
const statusColor = (status?: number) =>
  ({ 0: 'default', 1: 'success', 2: 'default' })[status ?? 0] || 'default'

const formatTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '')

const loadData = async () => {
  try {
    const res = await pageAnnouncements({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchParams.keyword,
      status: searchParams.status,
    })
    if (res.data?.code === 0 && res.data.data) {
      data.value = res.data.data.records || []
      pagination.total = res.data.data.totalRow || 0
    } else {
      message.error(res.data?.message || '加载公告失败')
    }
  } catch (error) {
    console.error('加载公告失败：', error)
    message.error('加载公告失败')
  }
}

/**
 * 增删改之后：刷新管理列表，同时让全站共享的公告缓存失效。
 * 不刷缓存的话，侧栏红点和公告列表要等 60 秒过期才更新。
 */
const refreshAfterMutate = async () => {
  await loadData()
  await refreshAnnouncementFeed()
}

const doSearch = () => {
  pagination.current = 1
  loadData()
}

const doReset = () => {
  searchParams.keyword = undefined
  searchParams.status = undefined
  pagination.current = 1
  loadData()
}

const doTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current || 1
  pagination.pageSize = page.pageSize || 10
  loadData()
}

const resetForm = () => {
  formState.id = undefined
  formState.title = ''
  formState.content = ''
  formState.level = 'INFO'
  formState.topFlag = 0
  formState.publishNow = true
  formState.publishTime = undefined
  formState.expireTime = undefined
}

const openCreate = () => {
  resetForm()
  formOpen.value = true
}

const openEdit = (record: AnnouncementEntity) => {
  resetForm()
  formState.id = record.id
  formState.title = record.title
  formState.content = record.content
  formState.level = record.level || 'INFO'
  formState.topFlag = record.topFlag ?? 0
  formState.publishNow = record.status === 1
  formState.publishTime = record.publishTime ? dayjs(record.publishTime) : undefined
  formState.expireTime = record.expireTime ? dayjs(record.expireTime) : undefined
  formOpen.value = true
}

const doSubmit = async () => {
  if (!formState.title.trim()) {
    message.warning('请填写标题')
    return
  }
  if (!formState.content.trim()) {
    message.warning('请填写正文')
    return
  }

  submitting.value = true
  try {
    const res = await saveAnnouncement({
      id: formState.id,
      title: formState.title.trim(),
      content: formState.content,
      level: formState.level,
      topFlag: formState.topFlag,
      publishNow: formState.publishNow,
      // 必须用 ISO 的 T 分隔：Jackson 的 LocalDateTimeDeserializer 默认只认
      // 2026-10-29T11:57:31，写成空格会在 index 10 处解析失败。
      // 界面上的显示格式由 DatePicker 的 format 控制，和这里无关。
      publishTime: formState.publishTime?.format('YYYY-MM-DDTHH:mm:ss'),
      expireTime: formState.expireTime?.format('YYYY-MM-DDTHH:mm:ss'),
    })
    if (res.data?.code === 0) {
      message.success(formState.id ? '已保存' : '已发布')
      formOpen.value = false
      await refreshAfterMutate()
    } else {
      message.error(res.data?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存公告失败：', error)
    message.error('保存失败')
  } finally {
    submitting.value = false
  }
}

const doPublish = async (record: AnnouncementEntity) => {
  try {
    const res = await publishAnnouncement(record.id)
    if (res.data?.code === 0) {
      message.success('已发布')
      await refreshAfterMutate()
    } else {
      message.error(res.data?.message || '发布失败')
    }
  } catch (error) {
    console.error('发布公告失败：', error)
    message.error('发布失败')
  }
}

const doOffline = async (record: AnnouncementEntity) => {
  try {
    const res = await offlineAnnouncement(record.id)
    if (res.data?.code === 0) {
      message.success('已下线')
      await refreshAfterMutate()
    } else {
      message.error(res.data?.message || '下线失败')
    }
  } catch (error) {
    console.error('下线公告失败：', error)
    message.error('下线失败')
  }
}

const doDelete = async (record: AnnouncementEntity) => {
  try {
    const res = await deleteAnnouncement(record.id)
    if (res.data?.code === 0) {
      message.success('已删除')
      await refreshAfterMutate()
    } else {
      message.error(res.data?.message || '删除失败')
    }
  } catch (error) {
    console.error('删除公告失败：', error)
    message.error('删除失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
#announcementManagePage {
  padding: 16px;
}

.table-toolbar {
  margin: 16px 0 12px;
}

.cell-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
