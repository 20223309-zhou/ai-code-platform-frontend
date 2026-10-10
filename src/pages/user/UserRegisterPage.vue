<template>
  <AuthShell
    badge="创建你的 AI 工作台"
    title="用户注册"
    desc="填写信息并通过邮箱验证后即可开始"
  >
    <a-form :model="formState" name="basic" layout="vertical" autocomplete="off" @finish="handleSubmit">
      <!-- 账号 / 邮箱：语义上一组，两列并排；两个验证码各带按钮，必须整行 -->
      <a-row :gutter="14">
        <a-col :span="12">
          <a-form-item
            name="userAccount"
            label="账号"
            :rules="[
              { required: true, message: '请输入账号' },
              { min: 4, message: '账号不能小于 4 位' },
              { validator: validateUserAccount },
            ]"
          >
            <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item
            name="email"
            label="邮箱"
            :rules="[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]"
          >
            <a-input v-model:value="formState.email" placeholder="用于登录、收验证码" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item
        name="captchaCode"
        label="图形验证码"
        :rules="[{ required: true, message: '请输入图形验证码' }]"
      >
        <div class="captcha-row">
          <a-input v-model:value="formState.captchaCode" placeholder="请输入图形验证码" />
          <button type="button" class="captcha-card" @click="handleRefreshCaptcha">
            <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image" />
            <span v-else class="captcha-placeholder">加载中...</span>
          </button>
        </div>
      </a-form-item>

      <a-form-item
        name="emailCode"
        label="邮箱验证码"
        :rules="[{ required: true, message: '请输入邮箱验证码' }]"
      >
        <div class="captcha-row">
          <a-input v-model:value="formState.emailCode" placeholder="查收邮件，填写 6 位验证码" />
          <button
            type="button"
            class="send-code-btn"
            :disabled="sendingCode || countdown > 0"
            @click="handleSendEmailCode"
          >
            {{ sendButtonText }}
          </button>
        </div>
      </a-form-item>

      <!-- 密码 / 确认密码：语义上一组，两列并排 -->
      <a-row :gutter="14">
        <a-col :span="12">
          <a-form-item
            name="userPassword"
            label="密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码不能小于 8 位' },
            ]"
          >
            <a-input-password v-model:value="formState.userPassword" placeholder="8 位以上" />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item
            name="checkPassword"
            label="确认密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { min: 8, message: '密码不能小于 8 位' },
              { validator: validateCheckPassword },
            ]"
          >
            <a-input-password v-model:value="formState.checkPassword" placeholder="再次输入" />
          </a-form-item>
        </a-col>
      </a-row>

      <div class="auth-tips">
        已有账号？<RouterLink to="/user/login">去登录</RouterLink>
      </div>

      <a-form-item>
        <a-button class="auth-submit" html-type="submit" :loading="submitting">
          {{ submitting ? '注册中' : '注册' }}
        </a-button>
      </a-form-item>
    </a-form>
  </AuthShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getCaptcha, sendEmailCode, userRegister } from '@/api/userController.ts'
import AuthShell from '@/components/AuthShell.vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const router = useRouter()

/** 图形验证码只用于"发送邮箱验证码"这一动作，不入注册请求体 */
type RegisterForm = API.UserRegisterRequest & { captchaCode: string }

const formState = reactive<RegisterForm>({
  userAccount: '',
  email: '',
  emailCode: '',
  userPassword: '',
  checkPassword: '',
  captchaCode: '',
})

const captchaImage = ref('')
const captchaKey = ref('')
const sendingCode = ref(false)
const submitting = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const sendButtonText = computed(() => {
  if (sendingCode.value) {
    return '发送中'
  }
  return countdown.value > 0 ? `${countdown.value}s 后重发` : '发送验证码'
})

const validateUserAccount = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  // 后端会拒绝含 @ 的账号，前端提前拦一下，避免白填一遍表单
  if (value && value.includes('@')) {
    callback(new Error('账号不能包含 @'))
  } else {
    callback()
  }
}

const validateCheckPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== formState.userPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const handleRefreshCaptcha = async () => {
  try {
    const res = await getCaptcha(captchaKey.value || undefined)
    if (res.data.code === 0 && res.data.data) {
      captchaKey.value = res.data.data.captchaKey || ''
      formState.captchaCode = ''
      captchaImage.value = res.data.data.captchaImage || ''
    } else {
      message.error('验证码加载失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载图形验证码失败：', error)
    message.error('验证码加载失败，请重试')
  }
}

const startCountdown = () => {
  countdown.value = 60
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const handleSendEmailCode = async () => {
  if (sendingCode.value || countdown.value > 0) {
    return
  }
  if (!formState.email) {
    message.warning('请先输入邮箱')
    return
  }
  if (!formState.captchaCode) {
    message.warning('请先输入图形验证码')
    return
  }
  sendingCode.value = true
  try {
    const res = await sendEmailCode({
      email: formState.email,
      scene: 'register',
      captchaKey: captchaKey.value,
      captchaCode: formState.captchaCode,
    })
    if (res.data.code === 0) {
      message.success('验证码已发送，请查收邮件')
      startCountdown()
    } else {
      message.error(res.data.message || '验证码发送失败')
    }
  } catch (error) {
    console.error('发送邮箱验证码失败：', error)
    message.error('验证码发送失败，请检查网络后重试')
  } finally {
    sendingCode.value = false
    // 图形验证码是一次性的（后端无论成败都会作废），所以每次发送后都换一张，
    // 否则用户点第二次必然收到"验证码错误"
    await handleRefreshCaptcha()
  }
}

const handleSubmit = async () => {
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
    // 显式组装请求体，避免把 captchaCode 一起发给注册接口
    const res = await userRegister({
      userAccount: formState.userAccount,
      email: formState.email,
      emailCode: formState.emailCode,
      userPassword: formState.userPassword,
      checkPassword: formState.checkPassword,
    })
    if (res.data.code === 0) {
      message.success('注册成功')
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败，' + res.data.message)
    }
  } catch (error) {
    console.error('注册请求失败：', error)
    message.error('注册失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  handleRefreshCaptcha()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>
