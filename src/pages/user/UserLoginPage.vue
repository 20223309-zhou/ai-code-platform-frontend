<template>
  <div class="auth-page">
    <div id="userLoginPage" class="auth-split">
      <!-- 左侧品牌区 -->
      <div class="auth-brand">
        <div class="brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ai-primary)" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h1 class="brand-title">iCodeAI</h1>
        <p class="brand-desc">自然语言驱动的AI应用生成平台</p>
        <div class="brand-features">
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>一句话描述，AI 自动生成完整应用</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>多轮对话迭代修改，所见即所得</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>支持 HTML / 多文件 / Vue 三种模式</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>一键部署上线，模板可复用</span>
          </div>
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="auth-panel">
        <div class="auth-badge">欢迎回来</div>
        <h2 class="panel-title">账号登录</h2>
        <p class="panel-desc">输入账号密码后完成登录</p>

        <a-form :model="formState" name="basic" autocomplete="off" class="auth-form" @finish="handleSubmit">
          <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
          </a-form-item>

          <a-form-item
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码长度不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
          </a-form-item>

          <div class="captcha-row">
            <a-form-item
              class="captcha-input-item"
              name="captchaCode"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <a-input v-model:value="formState.captchaCode" placeholder="请输入验证码" size="large" />
            </a-form-item>

            <button type="button" class="captcha-card" @click="handleRefreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image" />
              <span v-else class="captcha-placeholder">加载中...</span>
            </button>
          </div>

          <div class="tips">
            没有账号？<RouterLink to="/user/register">去注册</RouterLink>
          </div>

          <a-form-item>
            <a-button type="primary" html-type="submit" class="submit-button">登录</a-button>
          </a-form-item>

          <div class="oauth-divider"><span>或</span></div>

          <a-button class="github-btn" :href="githubAuthUrl">
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </template>
            GitHub 登录
          </a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { getCaptcha, userLogin } from '@/api/userController.ts'
import request from '@/request'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const githubAuthUrl = computed(() => {
  const base = request.defaults.baseURL || ''
  return base + '/oauth2/authorization/github'
})

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
  captchaKey: '',
  captchaCode: '',
})

const captchaImage = ref('')

const isCaptchaError = (errorMessage: string) => /验证码|过期|captcha/i.test(errorMessage)

const handleRefreshCaptcha = async () => {
  try {
    const res = await getCaptcha(formState.captchaKey || undefined)
    if (res.data.code === 0 && res.data.data) {
      formState.captchaKey = res.data.data.captchaKey || ''
      formState.captchaCode = ''
      captchaImage.value = res.data.data.captchaImage || ''
    } else {
      message.error('验证码加载失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载验证码失败：', error)
    message.error('验证码加载失败，请重试')
  }
}

const handleSubmit = async () => {
  const res = await userLogin({ ...formState })
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    await router.push({
      path: '/',
      replace: true,
    })
    return
  }

  const errorMessage = res.data.message || '登录失败'
  message.error('登录失败：' + errorMessage)
  if (isCaptchaError(errorMessage)) {
    await handleRefreshCaptcha()
  }
}

onMounted(() => {
  handleRefreshCaptcha()
})
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
    radial-gradient(ellipse 50% 35% at 30% 20%, rgba(79, 124, 255, 0.07), transparent),
    radial-gradient(ellipse 40% 30% at 70% 80%, rgba(52, 211, 153, 0.04), transparent);
  pointer-events: none;
}

/* ───── 左右分栏 ───── */
.auth-split {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 880px;
  min-height: 500px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  background: rgba(21, 23, 32, 0.55);
  backdrop-filter: blur(40px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

/* ───── 左侧品牌区 ───── */
.auth-brand {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 40px;
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.04), rgba(79, 124, 255, 0.01));
  border-right: 1px solid rgba(255, 255, 255, 0.04);
}

.brand-logo {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--ai-title);
  letter-spacing: -0.02em;
}

.brand-desc {
  margin: 0 0 36px;
  color: var(--ai-muted);
  font-size: 14px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ai-text);
  font-size: 14px;
  line-height: 1.4;
}

.brand-feature svg {
  flex-shrink: 0;
}

/* ───── 右侧面板 ───── */
.auth-panel {
  width: 400px;
  padding: 44px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-badge {
  width: fit-content;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.08);
  color: var(--ai-primary);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}

.panel-title {
  margin: 0 0 6px;
  color: var(--ai-title);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.panel-desc {
  margin: 0 0 28px;
  color: var(--ai-muted);
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

#userLoginPage :deep(.ant-form-item) {
  margin-bottom: 18px;
}

.captcha-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.captcha-input-item {
  flex: 1;
}

.captcha-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 132px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  overflow: hidden;
  transition: var(--ai-transition);
}

.captcha-card:hover {
  border-color: rgba(79, 124, 255, 0.2);
  box-shadow: 0 8px 22px rgba(79, 124, 255, 0.12);
  transform: translateY(-1px);
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  color: var(--ai-muted);
  font-size: 12px;
}

#userLoginPage :deep(.ant-input),
#userLoginPage :deep(.ant-input-affix-wrapper) {
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  color: var(--ai-title);
  caret-color: var(--ai-primary);
}

#userLoginPage :deep(.ant-input) {
  line-height: 48px;
  letter-spacing: 0.02em;
}

#userLoginPage :deep(.ant-input-affix-wrapper .ant-input) {
  height: 100%;
  padding: 0;
  line-height: normal;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

#userLoginPage :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.1);
}

#userLoginPage :deep(.ant-input:focus),
#userLoginPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}

#userLoginPage :deep(.ant-input-password-icon) {
  color: var(--ai-muted);
}

#userLoginPage :deep(.ant-input-password-icon:hover) {
  color: var(--ai-primary);
}

.tips {
  margin-bottom: 18px;
  text-align: right;
  color: var(--ai-muted);
  font-size: 13px;
}

.tips a {
  color: var(--ai-primary);
  font-weight: 600;
}

.tips a:hover {
  text-decoration: underline;
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

/* ───── OAuth 分隔线 ───── */
.oauth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: var(--ai-muted);
  font-size: 12px;
}
.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}
.oauth-divider span {
  white-space: nowrap;
}

/* ───── GitHub 登录按钮 ───── */
.github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--ai-title);
  font-size: 14px;
  transition: all 0.25s;
}
.github-btn:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ai-primary);
}

@media (max-width: 768px) {
  .auth-split {
    flex-direction: column;
    max-width: 440px;
  }
  .auth-brand {
    padding: 32px 28px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .brand-features {
    gap: 12px;
  }
  .auth-panel {
    width: 100%;
    padding: 32px 28px;
  }
}

@media (max-width: 520px) {
  .captcha-row {
    flex-direction: column;
  }
  .captcha-card {
    width: 100%;
  }
}
</style>
