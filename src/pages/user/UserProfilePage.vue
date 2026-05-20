<template>
  <div class="auth-page">
    <div id="userProfilePage" class="auth-card">
      <div class="auth-badge">账户设置</div>
      <h2 class="title">个人资料</h2>
      <div class="desc">修改你的头像、用户名和简介</div>

      <!-- 会员信息卡片 -->
      <div class="vip-info-card">
        <div class="vip-info-left">
          <span class="vip-info-label">会员等级</span>
          <span class="vip-info-value" :class="'vip-level-' + (vipLevel || 0)">
            {{ vipLevelText }}
          </span>
        </div>
        <div class="vip-info-right">
          <span class="vip-info-label">剩余额度</span>
          <span class="vip-info-value">{{ quota }} 次</span>
        </div>
      </div>

      <a-form :model="formState" layout="vertical" class="auth-form" @finish="handleSubmit">
        <a-form-item label="头像">
          <div class="avatar-upload">
            <a-upload
              :showUploadList="false"
              :beforeUpload="beforeUpload"
              accept="image/*"
            >
              <a-avatar :size="80" :src="previewUrl || loginUserStore.loginUser.userAvatar" />
            </a-upload>
            <span class="avatar-hint">点击头像上传</span>
          </div>
        </a-form-item>

        <a-form-item
          label="用户名"
          name="userName"
          :rules="[{ max: 20, message: '用户名不能超过 20 个字符' }]"
        >
          <a-input v-model:value="formState.userName" placeholder="请输入用户名" size="large" />
        </a-form-item>

        <a-form-item label="简介" name="userProfile">
          <a-textarea
            v-model:value="formState.userProfile"
            placeholder="介绍一下自己吧"
            :rows="4"
            :maxlength="200"
            showCount
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button" :loading="submitting">
            保存修改
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { updateUserBySelf } from '@/api/userController.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const submitting = ref(false)
const avatarFile = ref<File | undefined>(undefined)
const previewUrl = ref<string | undefined>(undefined)

const vipLevel = computed(() => loginUserStore.loginUser.vipLevel ?? 0)
const quota = computed(() => loginUserStore.loginUser.quota ?? 0)
const vipLevelText = computed(() => {
  const level = vipLevel.value
  if (level >= 2) return 'SVIP 会员'
  if (level >= 1) return 'VIP 会员'
  return '普通用户'
})

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
})

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }
  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  return false
}

const handleSubmit = async () => {
  if (!formState.id) {
    message.error('用户信息异常，请重新登录')
    return
  }
  submitting.value = true
  try {
    const res = await updateUserBySelf(
      {
        id: formState.id,
        userName: formState.userName || undefined,
        userProfile: formState.userProfile || undefined,
      },
      avatarFile.value,
    )
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser()
      message.success('保存成功')
      router.push('/')
    } else {
      message.error('保存失败，' + (res.data.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: var(--ai-bg);
  position: relative;
}

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 35% at 30% 20%, rgba(108, 125, 255, 0.08), transparent),
    radial-gradient(ellipse 40% 30% at 70% 80%, rgba(0, 245, 212, 0.04), transparent);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 36px 28px 26px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  background: rgba(21, 23, 32, 0.6);
  backdrop-filter: blur(36px);
  -webkit-backdrop-filter: blur(36px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  animation: fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.auth-badge {
  width: fit-content;
  margin: 0 auto 14px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.08);
  color: var(--ai-primary);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.title {
  margin: 0 0 8px;
  text-align: center;
  color: var(--ai-title);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.desc {
  margin-bottom: 26px;
  text-align: center;
  color: var(--ai-muted);
  font-size: 14px;
  letter-spacing: 0.01em;
}

.auth-form {
  display: flex;
  flex-direction: column;
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
  border: 2px solid rgba(255, 255, 255, 0.06);
}

.avatar-upload .ant-avatar:hover {
  opacity: 0.8;
}

.avatar-hint {
  font-size: 12px;
  color: var(--ai-muted);
}

#userProfilePage :deep(.ant-form-item) {
  margin-bottom: 18px;
}

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

#userProfilePage :deep(.ant-input) {
  line-height: 48px;
  letter-spacing: 0.02em;
}

#userProfilePage :deep(.ant-input-affix-wrapper .ant-input) {
  height: 100%;
  padding: 0;
  line-height: normal;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

#userProfilePage :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.1);
}

#userProfilePage :deep(.ant-input:focus),
#userProfilePage :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}

#userProfilePage :deep(textarea.ant-input) {
  min-height: 100px;
  padding: 12px 14px;
  line-height: 1.6;
  resize: vertical;
}

#userProfilePage :deep(.ant-input-textarea-show-count::after) {
  color: var(--ai-muted);
  font-size: 12px;
}

/* ───── VIP 信息卡片 ───── */
.vip-info-card {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}
.vip-info-left,
.vip-info-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vip-info-label {
  font-size: 12px;
  color: var(--ai-muted);
  letter-spacing: 0.02em;
}
.vip-info-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--ai-title);
}
.vip-level-0 {
  color: var(--ai-muted);
}
.vip-level-1 {
  color: #34d399;
}
.vip-level-2 {
  color: #f97316;
}

.submit-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #4f7cff, #2d4fc7);
  box-shadow: 0 6px 20px rgba(79, 124, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.submit-button:hover,
.submit-button:focus {
  background: linear-gradient(135deg, #5f8cff, #3d5fd7) !important;
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(79, 124, 255, 0.3);
}

.submit-button:active {
  transform: scale(0.98);
}
</style>
