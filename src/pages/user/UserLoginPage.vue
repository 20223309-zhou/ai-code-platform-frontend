<template>
  <AuthShell badge="欢迎回来" title="账号登录" desc="输入账号或邮箱后完成登录">
    <a-form :model="formState" name="basic" layout="vertical" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        name="userAccount"
        label="账号 / 邮箱"
        :rules="[{ required: true, message: '请输入账号或邮箱' }]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号或邮箱" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        label="密码"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能小于 8 位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>

      <a-form-item
        name="captchaCode"
        label="验证码"
        :rules="[{ required: true, message: '请输入验证码' }]"
      >
        <div class="captcha-row">
          <a-input v-model:value="formState.captchaCode" placeholder="请输入验证码" />
          <button type="button" class="captcha-card" @click="handleRefreshCaptcha">
            <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image" />
            <span v-else class="captcha-placeholder">加载中...</span>
          </button>
        </div>
      </a-form-item>

      <div class="auth-tips">
        没有账号？<RouterLink to="/user/register">去注册</RouterLink>
      </div>

      <a-form-item>
        <a-button class="auth-submit" html-type="submit" :loading="submitting">
          {{ submitting ? '登录中' : '登录' }}
        </a-button>
      </a-form-item>

      <div class="oauth-divider"><span>或</span></div>

      <a-button class="github-btn" :href="githubAuthUrl">
        <template #icon>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        </template>
        GitHub 登录
      </a-button>
    </a-form>
  </AuthShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import AuthShell from '@/components/AuthShell.vue'
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
const submitting = ref(false)

// 与后端 ErrorCode 保持一致，按 code 判断而不是靠文案正则匹配
// （正则匹配很脆，后端改一个字的措辞就失效）
const ERROR_CODE = {
  CAPTCHA_ERROR: 40001,
  TOO_MANY_REQUEST: 42900,
}

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
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
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

    const code = res.data.code
    const errorMessage = res.data.message || '登录失败'

    // 被限流时切面在方法体执行前就拦截了，验证码没有被消费，不用刷新
    if (code === ERROR_CODE.TOO_MANY_REQUEST) {
      message.error(errorMessage)
      return
    }

    // 验证码是一次性的：只要请求到达后端，无论账号密码对错、验证码对错，
    // 服务端都会在 finally 里作废当前验证码。所以任何非限流的失败都必须换一张，
    // 否则用户改完密码再点登录，会先吃一次"验证码错误或已过期"。
    if (code === ERROR_CODE.CAPTCHA_ERROR) {
      message.error(errorMessage)
    } else {
      message.error('登录失败：' + errorMessage)
    }
    await handleRefreshCaptcha()
  } catch (error) {
    // 网络异常 / 5xx：无法确定验证码是否被消费，一并刷新最稳妥
    console.error('登录请求失败：', error)
    message.error('登录失败，请检查网络后重试')
    await handleRefreshCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  handleRefreshCaptcha()
})
</script>

<style scoped>
/* 表单控件样式统一放在 AuthShell 里（登录/注册共用），这里只留登录页专有的部分 */

/* ───── 分隔线 ───── */
.oauth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
  color: var(--ai-muted);
  font-size: 12px;
}

.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--ai-border);
}

.oauth-divider span {
  white-space: nowrap;
}

/* ───── GitHub 登录：次级纸片按钮 ───── */
.github-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  border: 1px solid var(--ai-border) !important;
  border-radius: var(--ai-control-radius);
  background: var(--ai-surface) !important;
  color: var(--ai-title) !important;
  font-size: 14px;
  box-shadow: 2px 3px 0 rgba(184, 152, 104, 0.2);
  transition: var(--ai-transition);
}

.github-btn:hover {
  border-color: rgba(var(--ai-accent-rgb), 0.45) !important;
  color: var(--ai-primary) !important;
  transform: translate(-1px, -1px);
  box-shadow: 3px 4px 0 rgba(184, 152, 104, 0.26);
}
</style>
