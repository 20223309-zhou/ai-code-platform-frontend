<template>
  <div id="userProfilePage">
    <div class="profile-shell">

      <!-- 左侧：用户信息 -->
      <div class="profile-main">
        <div class="section-card">
          <div class="section-header">
            <h2 class="section-title">个人资料</h2>
            <span class="section-desc">修改你的头像、用户名和简介</span>
          </div>

          <a-form :model="formState" layout="vertical" class="profile-form" @finish="handleSubmit">
            <a-form-item label="头像">
              <div class="avatar-upload">
                <a-upload :showUploadList="false" :beforeUpload="beforeUpload" accept="image/*">
                  <a-avatar :size="80" :src="previewUrl || loginUserStore.loginUser.userAvatar" />
                </a-upload>
                <span class="avatar-hint">点击头像上传</span>
              </div>
            </a-form-item>

            <a-form-item label="用户名" name="userName" :rules="[{ max: 20, message: '用户名不能超过 20 个字符' }]">
              <a-input v-model:value="formState.userName" placeholder="请输入用户名" size="large" />
            </a-form-item>

            <a-form-item label="简介" name="userProfile">
              <a-textarea v-model:value="formState.userProfile" placeholder="介绍一下自己吧" :rows="4" :maxlength="200" showCount size="large" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" class="save-btn" :loading="submitting">保存修改</a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 作品列表 -->
        <div class="section-card">
          <div class="section-header">
            <h2 class="section-title">我的作品</h2>
            <span class="section-desc">共 {{ stats.totalApps }} 个应用</span>
          </div>
          <div v-if="myApps.length === 0" class="empty-state">
            <span>还没有创建过应用</span>
          </div>
          <div v-else class="app-list">
            <div v-for="app in myApps" :key="app.id" class="app-row" @click="goChat(app.id)">
              <div class="app-row-body">
                <div class="app-row-name">{{ app.appName }}</div>
                <div class="app-row-meta">
                  <span class="app-row-type">{{ formatCodeGenType(app.codeGenType) }}</span>
                  <span class="app-row-time">{{ formatTime(app.createTime) }}</span>
                  <span v-if="app.deployKey" class="app-row-deployed">已部署</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ai-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：会员 + 统计 -->
      <div class="profile-sidebar">
        <!-- 会员信息 -->
        <div class="section-card">
          <div class="vip-header">
            <div class="vip-icon" :class="'vip-icon-' + (vipLevel || 0)">
              <svg v-if="vipLevel >= 2" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg v-else-if="vipLevel >= 1" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor" opacity="0.3"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="vip-info">
              <div class="vip-level" :class="'vip-level-' + (vipLevel || 0)">{{ vipLevelText }}</div>
              <div class="vip-quota">剩余 {{ stats.remainingQuota }} 次生成</div>
            </div>
          </div>
        </div>

        <!-- 使用统计 -->
        <div class="section-card">
          <h3 class="card-title">使用统计</h3>
          <div class="stat-items">
            <div class="stat-item">
              <div class="stat-num">{{ stats.totalApps }}</div>
              <div class="stat-label">总生成次数</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-num">{{ stats.deployedApps }}</div>
              <div class="stat-label">已部署</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-num">{{ stats.remainingQuota }}</div>
              <div class="stat-label">剩余额度</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { updateUserBySelf } from '@/api/userController.ts'
import { listMyAppVoByPage } from '@/api/appController'
import { formatCodeGenType } from '@/utils/codeGenTypes'
import request from '@/request'
import dayjs from 'dayjs'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const submitting = ref(false)
const avatarFile = ref<File | undefined>(undefined)
const previewUrl = ref<string | undefined>(undefined)

const vipLevel = computed(() => loginUserStore.loginUser.vipLevel ?? 0)
const vipLevelText = computed(() => {
  const level = vipLevel.value
  if (level >= 2) return 'SVIP 会员'
  if (level >= 1) return 'VIP 会员'
  return '普通用户'
})

/* ─── 使用统计 ─── */
const stats = reactive({
  totalApps: 0,
  deployedApps: 0,
  remainingQuota: 0,
})

const fetchStats = async () => {
  try {
    const res = await request('/app/my/statistics')
    if (res.data?.code === 0 && res.data?.data) {
      Object.assign(stats, res.data.data)
    }
  } catch { /* ignore */ }
}

/* ─── 我的作品 ─── */
interface AppItem {
  id?: string
  appName?: string
  codeGenType?: string
  createTime?: string
  deployKey?: string
}

const myApps = ref<AppItem[]>([])

const fetchMyApps = async () => {
  try {
    const res = await listMyAppVoByPage({ pageNum: 1, pageSize: 10 })
    if (res.data?.code === 0 && res.data?.data) {
      myApps.value = (res.data.data.records || []).slice(0, 5)
    }
  } catch { /* ignore */ }
}

const formatTime = (t?: string) => t ? dayjs(t).format('MM-DD') : ''
const goChat = (id?: string) => id && router.push(`/app/chat/${id}?view=1`)

/* ─── 个人资料 ─── */
const formState = reactive<API.UserUpdateRequest>({
  id: undefined,
  userName: undefined,
  userProfile: undefined,
})

onMounted(() => {
  const user = loginUserStore.loginUser
  formState.id = user.id
  formState.userName = user.userName || ''
  formState.userProfile = user.userProfile || ''
  fetchStats()
  fetchMyApps()
})

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) { message.error('只能上传图片文件'); return false }
  if (file.size / 1024 / 1024 >= 2) { message.error('图片大小不能超过 2MB'); return false }
  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  return false
}

const handleSubmit = async () => {
  if (!formState.id) { message.error('用户信息异常，请重新登录'); return }
  submitting.value = true
  try {
    const res = await updateUserBySelf(
      { id: formState.id, userName: formState.userName || undefined, userProfile: formState.userProfile || undefined },
      avatarFile.value,
    )
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser()
      message.success('保存成功')
      fetchStats()
    } else {
      message.error('保存失败，' + (res.data.message || '未知错误'))
    }
  } finally { submitting.value = false }
}
</script>

<style scoped>
#userProfilePage {
  padding: 32px 24px;
  min-height: calc(100vh - 64px);
  background: var(--ai-bg);
}

.profile-shell {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  animation: fade-up 0.5s ease-out;
}

/* ───── 左侧主区域 ───── */
.profile-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ───── 右侧边栏 ───── */
.profile-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ───── 通用卡片 ───── */
.section-card {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(21, 23, 32, 0.6);
  backdrop-filter: blur(36px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}
.section-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 24px;
}
.section-title {
  margin: 0;
  color: var(--ai-title);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.section-desc {
  color: var(--ai-muted);
  font-size: 13px;
}

/* ───── 个人资料表单 ───── */
.profile-form {
  max-width: 420px;
}
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.avatar-upload .ant-avatar {
  cursor: pointer;
  transition: opacity 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.08);
}
.avatar-upload .ant-avatar:hover { opacity: 0.8; }
.avatar-hint { font-size: 12px; color: var(--ai-muted); }

#userProfilePage :deep(.ant-form-item) { margin-bottom: 18px; }
#userProfilePage :deep(.ant-form-item-label > label) {
  color: var(--ai-title);
  font-size: 13px;
  font-weight: 500;
}
#userProfilePage :deep(.ant-input),
#userProfilePage :deep(.ant-input-affix-wrapper) {
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  color: var(--ai-title);
  caret-color: var(--ai-primary);
}
#userProfilePage :deep(.ant-input) { line-height: 48px; letter-spacing: 0.02em; }
#userProfilePage :deep(.ant-input-affix-wrapper .ant-input) {
  height: 100%; padding: 0; line-height: normal; border: none; border-radius: 0; background: transparent; box-shadow: none;
}
#userProfilePage :deep(.ant-input-affix-wrapper:hover) { border-color: rgba(255, 255, 255, 0.1); }
#userProfilePage :deep(.ant-input:focus),
#userProfilePage :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}
#userProfilePage :deep(textarea.ant-input) {
  min-height: 100px; padding: 12px 14px; line-height: 1.6; resize: vertical;
}
#userProfilePage :deep(.ant-input-textarea-show-count::after) { color: var(--ai-muted); font-size: 12px; }

.save-btn {
  width: 100%; height: 44px; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 500; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #4f7cff, #2d4fc7);
  box-shadow: 0 6px 20px rgba(79, 124, 255, 0.2);
  transition: all 0.3s;
}
.save-btn:hover {
  background: linear-gradient(135deg, #5f8cff, #3d5fd7) !important;
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(79, 124, 255, 0.3) !important;
}

/* ───── 作品列表 ───── */
.empty-state {
  text-align: center; padding: 32px 0; color: var(--ai-muted); font-size: 14px;
}
.app-list {
  display: flex; flex-direction: column; gap: 2px;
}
.app-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 8px; cursor: pointer;
  transition: background 0.2s;
}
.app-row:hover { background: rgba(255, 255, 255, 0.03); }
.app-row-body { flex: 1; min-width: 0; }
.app-row-name {
  color: var(--ai-title); font-size: 14px; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.app-row-meta { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.app-row-type { font-size: 11px; color: var(--ai-primary); }
.app-row-time { font-size: 11px; color: var(--ai-muted); }
.app-row-deployed {
  font-size: 11px; color: #34d399; padding: 1px 6px;
  border-radius: 4px; background: rgba(52, 211, 153, 0.08);
}

/* ───── VIP 卡片 ───── */
.vip-header { display: flex; align-items: center; gap: 14px; }
.vip-icon {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.vip-icon-0 { background: rgba(255, 255, 255, 0.03); color: var(--ai-muted); }
.vip-icon-1 { background: rgba(52, 211, 153, 0.08); color: #34d399; }
.vip-icon-2 { background: rgba(249, 115, 22, 0.08); color: #f97316; }
.vip-info { display: flex; flex-direction: column; gap: 2px; }
.vip-level { font-size: 16px; font-weight: 700; }
.vip-level-0 { color: var(--ai-muted); }
.vip-level-1 { color: #34d399; }
.vip-level-2 { color: #f97316; }
.vip-quota { font-size: 12px; color: var(--ai-muted); }

/* ───── 使用统计 ───── */
.card-title { margin: 0 0 20px; color: var(--ai-title); font-size: 15px; font-weight: 500; }
.stat-items { display: flex; gap: 0; }
.stat-item { flex: 1; text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; color: var(--ai-title); line-height: 1.2; }
.stat-label { margin-top: 4px; font-size: 12px; color: var(--ai-muted); }
.stat-divider {
  width: 1px; background: rgba(255, 255, 255, 0.06); margin: 0 8px;
}

@media (max-width: 768px) {
  .profile-shell { flex-direction: column; }
  .profile-sidebar { width: 100%; }
}
</style>
