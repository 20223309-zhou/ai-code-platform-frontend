<template>
  <div class="auth-page">
    <div id="userLoginPage" class="auth-card">
      <div class="auth-badge">AI 工作流入口</div>
      <h2 class="title"> AI 应用生成 - 用户登录</h2>
      <div class="desc">不写一行代码，生成完整应用</div>
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
        <div class="tips">
          没有账号？
          <RouterLink to="/user/register">去注册</RouterLink>
        </div>
        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button">登录</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

const handleSubmit = async (values: any) => {
  const res = await userLogin(values)
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
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
  background: rgba(67, 97, 238, 0.08);
  color: var(--ai-primary);
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

#userLoginPage :deep(.ant-form-item) {
  margin-bottom: 18px;
}

#userLoginPage :deep(.ant-input),
#userLoginPage :deep(.ant-input-affix-wrapper) {
  height: 52px;
  padding: 0 14px;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.08);
}

#userLoginPage :deep(.ant-input) {
  line-height: 52px;
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
  border-color: var(--ai-border);
}

#userLoginPage :deep(.ant-input-affix-wrapper .ant-input-suffix) {
  display: flex;
  align-items: center;
}

#userLoginPage :deep(.ant-input:focus),
#userLoginPage :deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--ai-primary);
  box-shadow: inset 0 0 0 3px rgba(67, 97, 238, 0.12);
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
