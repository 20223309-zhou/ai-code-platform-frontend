<template>
  <div class="auth-page">
    <div id="userRegisterPage" class="auth-card">
      <div class="auth-badge">创建你的 AI 工作台</div>
      <h2 class="title"> AI 应用生成 - 用户注册</h2>
      <div class="desc">不写一行代码，生成完整应用</div>
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
  background:
    radial-gradient(circle at top left, rgba(67, 97, 238, 0.12), transparent 24%),
    radial-gradient(circle at 80% 20%, rgba(0, 245, 212, 0.14), transparent 18%),
    linear-gradient(180deg, #f8fafc 0%, #f2f7ff 100%);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 24px 28px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.92);
  box-shadow: 0 24px 60px rgba(67, 97, 238, 0.12);
  animation: fade-up 0.7s ease;
}

.auth-badge {
  width: fit-content;
  margin: 0 auto 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 245, 212, 0.12);
  color: var(--ai-primary-deep);
  font-size: 12px;
  font-weight: 700;
}

.title {
  margin: 0 0 10px;
  text-align: center;
  color: var(--ai-title);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

.desc {
  margin-bottom: 28px;
  text-align: center;
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
  height: 52px;
  padding: 0 14px;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.08);
}

#userRegisterPage :deep(.ant-input) {
  line-height: 52px;
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
  border-color: var(--ai-border);
}

#userRegisterPage :deep(.ant-input-affix-wrapper .ant-input-suffix) {
  display: flex;
  align-items: center;
}

#userRegisterPage :deep(.ant-input:focus),
#userRegisterPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--ai-primary);
  box-shadow: inset 0 0 0 3px rgba(67, 97, 238, 0.12);
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
  height: 52px;
  padding: 0 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  background: linear-gradient(135deg, var(--ai-primary), #5f78ff);
  box-shadow: 0 12px 24px rgba(67, 97, 238, 0.2);
}

.submit-button:hover,
.submit-button:focus {
  background: linear-gradient(135deg, var(--ai-primary-deep), var(--ai-primary)) !important;
  transform: translateY(-2px);
}

.submit-button:active {
  transform: scale(0.98);
}

.submit-button:active::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 14px;
  border: 2px solid rgba(0, 245, 212, 0.4);
  animation: pulse-ring 0.9s ease-out;
}
</style>
