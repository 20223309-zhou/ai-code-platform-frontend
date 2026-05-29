<template>
  <div class="auth-page">
    <div id="userRegisterPage" class="auth-split">
      <!-- 左侧品牌区 -->
      <div class="auth-brand">
        <div class="brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ai-primary)" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h1 class="brand-title">加入 iCodeAI</h1>
        <p class="brand-desc">不写一行代码，用自然语言生成完整应用</p>
        <div class="brand-features">
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>免费注册，立即开始生成</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>多种生成模式：HTML / 多文件 / Vue</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>对话式迭代修改，所见即所得</span>
          </div>
          <div class="brand-feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>一键部署，模板广场共享</span>
          </div>
        </div>
      </div>

      <!-- 右侧注册区 -->
      <div class="auth-panel">
        <div class="auth-badge">创建你的 AI 工作台</div>
        <h2 class="panel-title">用户注册</h2>
        <p class="panel-desc">不写一行代码，生成完整应用</p>
        <a-form :model="formState" name="basic" autocomplete="off" class="auth-form" @finish="handleSubmit">
          <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
          </a-form-item>
          <a-form-item
            name="userPassword"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
          </a-form-item>
          <a-form-item
            name="checkPassword"
            :rules="[
              { required: true, message: '请确认密码' },
              { min: 8, message: '密码不能小于 8 位' },
              { validator: validateCheckPassword },
            ]"
          >
            <a-input-password v-model:value="formState.checkPassword" placeholder="请确认密码" size="large" />
          </a-form-item>
          <div class="tips">
            已有账号？
            <RouterLink to="/user/login">去登录</RouterLink>
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" class="submit-button">注册</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import { reactive } from 'vue'

const router = useRouter()

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const handleSubmit = async (values: API.UserRegisterRequest) => {
  const res = await userRegister(values)
  if (res.data.code === 0) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
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

#userRegisterPage :deep(.ant-form-item) {
  margin-bottom: 18px;
}

#userRegisterPage :deep(.ant-input),
#userRegisterPage :deep(.ant-input-affix-wrapper) {
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  color: var(--ai-title);
  caret-color: var(--ai-primary);
}

#userRegisterPage :deep(.ant-input) {
  line-height: 48px;
  letter-spacing: 0.02em;
}

#userRegisterPage :deep(.ant-input-affix-wrapper .ant-input) {
  height: 100%;
  padding: 0;
  line-height: normal;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

#userRegisterPage :deep(.ant-input-affix-wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.1);
}

#userRegisterPage :deep(.ant-input:focus),
#userRegisterPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: rgba(79, 124, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: inset 0 0 0 1px rgba(79, 124, 255, 0.08), 0 0 16px rgba(79, 124, 255, 0.03);
}

#userRegisterPage :deep(.ant-input-password-icon) {
  color: var(--ai-muted);
}

#userRegisterPage :deep(.ant-input-password-icon:hover) {
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
</style>
