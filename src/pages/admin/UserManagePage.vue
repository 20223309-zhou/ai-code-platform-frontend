<template>
  <div id="userManagePage">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item label="VIP等级">
        <a-select v-model:value="searchParams.vipLevel" placeholder="选择VIP等级" style="width: 120px" allow-clear>
          <a-select-option :value="0">普通用户</a-select-option>
          <a-select-option :value="1">VIP</a-select-option>
          <a-select-option :value="2">SVIP</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider />
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="80" :height="60" style="object-fit: cover; border-radius: 6px;" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <span :class="['role-tag', record.userRole === 'admin' ? 'role-admin' : 'role-user']">
            {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'vipLevel'">
          <span v-if="record.vipLevel == null || record.vipLevel === 0" class="vip-tag vip-0">普通</span>
          <span v-else-if="record.vipLevel === 1" class="vip-tag vip-1">VIP</span>
          <span v-else-if="record.vipLevel >= 2" class="vip-tag vip-2">SVIP</span>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="openEdit(record)">编辑</a-button>
          <a-popconfirm title="确定删除该用户？" @confirm="doDelete(record.id)">
            <a-button danger type="link">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑用户"
      :confirm-loading="editLoading"
      @ok="handleEdit"
      @cancel="closeEdit"
      ok-text="保存"
      cancel-text="取消"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.userName" />
        </a-form-item>
        <a-form-item label="简介">
          <a-textarea v-model:value="editForm.userProfile" :rows="3" />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-radio-group v-model:value="editForm.userRole">
            <a-radio value="user">普通用户</a-radio>
            <a-radio value="admin">管理员</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="VIP等级">
          <a-select v-model:value="editForm.vipLevel" style="width: 200px">
            <a-select-option :value="0">普通用户</a-select-option>
            <a-select-option :value="1">VIP 会员</a-select-option>
            <a-select-option :value="2">SVIP 会员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="剩余额度（次）">
          <a-input-number v-model:value="editForm.quota" :min="0" style="width: 200px" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { deleteUser, listUserVoByPage, updateUser } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const columns = [
  { title: 'id', dataIndex: 'id', width: 80 },
  { title: '账号', dataIndex: 'userAccount', width: 120 },
  { title: '用户名', dataIndex: 'userName', width: 120 },
  { title: '头像', dataIndex: 'userAvatar', width: 100 },
  { title: '简介', dataIndex: 'userProfile', width: 160, ellipsis: true },
  { title: '角色', dataIndex: 'userRole', width: 100 },
  { title: 'VIP', dataIndex: 'vipLevel', width: 80 },
  { title: '额度', dataIndex: 'quota', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', width: 170 },
  { title: '操作', key: 'action', width: 130, fixed: 'right' },
]

const data = ref<API.UserVO[]>([])
const total = ref(0)

const searchParams = reactive<API.UserQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

const fetchData = async () => {
  const res = await listUserVoByPage({ ...searchParams })
  if (res.data.data) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.totalRow ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const pagination = computed(() => ({
  current: searchParams.pageNum ?? 1,
  pageSize: searchParams.pageSize ?? 10,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
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

const doDelete = async (id: string | undefined) => {
  if (!id) return
  const res = await deleteUser({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}

/* ─── 编辑弹窗 ─── */
const editModalVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive<API.UserUpdateRequest>({
  id: undefined,
  userName: undefined,
  userProfile: undefined,
  userRole: undefined,
  vipLevel: undefined,
  quota: undefined,
})

const openEdit = (record: API.UserVO) => {
  editForm.id = record.id
  editForm.userName = record.userName || ''
  editForm.userProfile = record.userProfile || ''
  editForm.userRole = record.userRole || 'user'
  editForm.vipLevel = record.vipLevel ?? 0
  editForm.quota = record.quota ?? 0
  editModalVisible.value = true
}

const closeEdit = () => {
  editModalVisible.value = false
}

const handleEdit = async () => {
  editLoading.value = true
  try {
    const res = await updateUser({
      id: editForm.id,
      userName: editForm.userName || undefined,
      userProfile: editForm.userProfile || undefined,
      userRole: editForm.userRole,
      vipLevel: editForm.vipLevel,
      quota: editForm.quota,
    })
    if (res.data.code === 0) {
      message.success('保存成功')
      editModalVisible.value = false
      fetchData()
    } else {
      message.error('保存失败：' + (res.data.message || '未知错误'))
    }
  } finally {
    editLoading.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<style>
/* 非 scoped：全局覆盖弹窗 radio 颜色 */
.ant-radio-wrapper {
  color: var(--ai-title) !important;
}
.ant-radio-wrapper .ant-radio-label {
  color: var(--ai-title) !important;
}
</style>

<style scoped>
#userManagePage {
  padding: 24px;
  background: var(--ai-surface);
  border: 1px solid var(--ai-glass-border);
  border-radius: 16px;
  margin-top: 16px;
}
#userManagePage :deep(.ant-form-item-label > label) {
  color: var(--ai-text);
}
/* 编辑弹窗样式修复 */
#userManagePage :deep(.ant-radio-wrapper) {
  color: var(--ai-title) !important;
  border-color: transparent;
}
#userManagePage :deep(.ant-radio-wrapper .ant-radio-label) {
  color: var(--ai-title) !important;
}
#userManagePage :deep(.ant-radio-wrapper:hover .ant-radio-label) {
  color: var(--ai-primary) !important;
}

/* 自定义角色/状态标签 */
.role-tag, .vip-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.role-admin {
  color: #34d399;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.15);
}
.role-user {
  color: var(--ai-text);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}
.vip-0 {
  color: var(--ai-muted);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}
.vip-1 {
  color: #34d399;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.15);
}
.vip-2 {
  color: #f97316;
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.15);
}
</style>
