<template>
  <div class="auth-page">
    <div id="userLoginPage" class="auth-card">
      <div class="auth-badge">AI 工作流入口</div>
      <h2 class="title">AI 应用生成 - 用户登录</h2>
      <div class="desc">输入账号密码后完成登录</div>

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
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { getCaptcha, userLogin } from '@/api/userController.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

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
    radial-gradient(ellipse 50% 35% at 30% 20%, rgba(108, 125, 255, 0.08), transparent),
    radial-gradient(ellipse 40% 30% at 70% 80%, rgba(0, 245, 212, 0.04), transparent);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 36px 24px 26px;
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

.captcha-hint {
  margin: -4px 0 18px;
  color: var(--ai-muted);
  font-size: 12px;
  text-align: right;
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

#userLoginPage :deep(.ant-input-affix-wrapper .ant-input-suffix) {
  display: flex;
  align-items: center;
}

#userLoginPage :deep(.ant-input:focus),
#userLoginPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}

#userLoginPage :deep(.ant-input-affix-wrapper input) {
  color: var(--ai-title);
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

@media (max-width: 520px) {
  .captcha-row {
    flex-direction: column;
  }

  .captcha-card {
    width: 100%;
  }
}
</style>
