<template>
  <div id="pointCenterPage">
    <a-row :gutter="16">
      <!-- 签到 -->
      <a-col :xs="24" :lg="12">
        <a-card :bordered="false" class="panel">
          <div class="panel-head">
            <h2 class="panel-title">每日签到</h2>
            <span class="panel-sub">连续签到 {{ account.continuousDays }} 天</span>
          </div>

          <div class="account-line">
            <div class="account-item">
              <span class="account-value">{{ account.balance }}</span>
              <span class="account-label">当前积分</span>
            </div>
            <div class="account-item">
              <span class="account-value">{{ account.totalEarned }}</span>
              <span class="account-label">累计获得</span>
            </div>
            <div class="account-item">
              <span class="account-value">{{ account.quota }}</span>
              <span class="account-label">剩余生成额度</span>
            </div>
          </div>

          <a-button
            type="primary"
            size="large"
            block
            class="sign-button"
            :loading="signing"
            :disabled="account.signedToday"
            @click="doSignIn"
          >
            {{ account.signedToday ? '今天已签到' : '签到领 1 积分' }}
          </a-button>

          <!-- 本月签到日历 -->
          <div class="calendar">
            <div class="calendar-week">
              <span v-for="w in ['日', '一', '二', '三', '四', '五', '六']" :key="w">{{ w }}</span>
            </div>
            <div class="calendar-grid">
              <span v-for="blank in leadingBlanks" :key="`b${blank}`" class="day is-blank" />
              <span
                v-for="day in calendarDays"
                :key="day.day"
                class="day"
                :class="{ 'is-signed': day.signed, 'is-today': day.isToday }"
              >
                {{ day.day }}
              </span>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 积分商城 -->
      <a-col :xs="24" :lg="12">
        <a-card :bordered="false" class="panel">
          <div class="panel-head">
            <h2 class="panel-title">积分商城</h2>
            <span class="panel-sub">1 积分 = 1 次生成额度</span>
          </div>

          <div v-for="goods in goodsList" :key="goods.id" class="goods">
            <div class="goods-main">
              <h3 class="goods-name">{{ goods.name }}</h3>
              <p class="goods-desc">{{ goods.description }}</p>
            </div>
            <div class="goods-side">
              <span class="goods-cost">{{ goods.cost }} 积分</span>
              <a-button
                type="primary"
                ghost
                :loading="exchanging"
                :disabled="account.balance < goods.cost"
                @click="doExchange(goods)"
              >
                兑换
              </a-button>
            </div>
          </div>

          <p v-if="account.balance < 1" class="goods-hint">
            积分不够了，明天签到再来
          </p>
        </a-card>
      </a-col>
    </a-row>

    <!-- 流水 -->
    <a-card :bordered="false" class="panel panel--table">
      <div class="panel-head">
        <h2 class="panel-title">积分流水</h2>
      </div>
      <a-table
        :columns="columns"
        :data-source="records"
        :pagination="pagination"
        :loading="loadingRecords"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'type'">
            {{ typeLabel(record.type) }}
          </template>
          <template v-else-if="column.dataIndex === 'amount'">
            <span :class="record.amount > 0 ? 'amount-plus' : 'amount-minus'">
              {{ record.amount > 0 ? `+${record.amount}` : record.amount }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ formatTime(record.createTime) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  exchangeGoods,
  getPointAccount,
  listPointGoods,
  pagePointRecords,
  signIn,
  type PointAccount,
  type PointGoods,
  type PointRecord,
} from '@/api/pointController'
import { useLoginUserStore } from '@/stores/loginUser'
import { getLoginUser } from '@/api/userController'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const account = ref<PointAccount>({
  balance: 0,
  totalEarned: 0,
  signedToday: false,
  continuousDays: 0,
  monthSignedDays: [],
  quota: 0,
})
const goodsList = ref<PointGoods[]>([])
const records = ref<PointRecord[]>([])

const signing = ref(false)
const exchanging = ref(false)
const loadingRecords = ref(false)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
})

const columns = [
  { title: '时间', dataIndex: 'createTime', width: 180 },
  { title: '类型', dataIndex: 'type', width: 120 },
  { title: '变动', dataIndex: 'amount', width: 100 },
  { title: '余额', dataIndex: 'balanceAfter', width: 100 },
  { title: '备注', dataIndex: 'remark' },
]

const today = new Date()
/** 本月 1 号是周几，用来在日历前面补空格 */
const leadingBlanks = computed(() => new Date(today.getFullYear(), today.getMonth(), 1).getDay())

const calendarDays = computed(() => {
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const signed = new Set(account.value.monthSignedDays || [])
  return Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    signed: signed.has(index + 1),
    isToday: index + 1 === today.getDate(),
  }))
})

const typeLabel = (type: string) =>
  ({ SIGN_IN: '每日签到', EXCHANGE: '兑换额度', ADMIN_ADJUST: '管理员调整' })[type] || type

const formatTime = (value?: string) => (value ? value.replace('T', ' ').slice(0, 16) : '')

/** 兑换会改 quota，顶部的"剩余次数"要跟着变 */
const refreshLoginUser = async () => {
  try {
    const res = await getLoginUser()
    if (res.data?.code === 0 && res.data.data) {
      loginUserStore.setLoginUser(res.data.data)
    }
  } catch (error) {
    console.warn('刷新用户信息失败：', error)
  }
}

const loadAccount = async () => {
  try {
    const res = await getPointAccount()
    if (res.data?.code === 0 && res.data.data) {
      account.value = res.data.data
    }
  } catch (error) {
    console.error('加载积分账户失败：', error)
  }
}

const loadRecords = async () => {
  loadingRecords.value = true
  try {
    const res = await pagePointRecords({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    })
    if (res.data?.code === 0 && res.data.data) {
      records.value = res.data.data.records || []
      pagination.total = res.data.data.totalRow || 0
    }
  } catch (error) {
    console.error('加载积分流水失败：', error)
  } finally {
    loadingRecords.value = false
  }
}

const onTableChange = (page: { current?: number; pageSize?: number }) => {
  pagination.current = page.current || 1
  pagination.pageSize = page.pageSize || 10
  loadRecords()
}

const doSignIn = async () => {
  if (account.value.signedToday) {
    return
  }
  signing.value = true
  try {
    const res = await signIn()
    if (res.data?.code === 0 && res.data.data) {
      message.success(`签到成功，获得 ${res.data.data.reward} 积分`)
      await loadAccount()
      await loadRecords()
    } else {
      message.warning(res.data?.message || '签到失败')
    }
  } catch (error) {
    console.error('签到失败：', error)
    message.error('签到失败，请稍后再试')
  } finally {
    signing.value = false
  }
}

const doExchange = async (goods: PointGoods) => {
  exchanging.value = true
  try {
    const res = await exchangeGoods(goods.id, 1)
    if (res.data?.code === 0 && res.data.data) {
      message.success(`兑换成功，额度 +${res.data.data.gainedQuota}`)
      await loadAccount()
      await loadRecords()
      await refreshLoginUser()
    } else {
      message.warning(res.data?.message || '兑换失败')
    }
  } catch (error) {
    console.error('兑换失败：', error)
    message.error('兑换失败，请稍后再试')
  } finally {
    exchanging.value = false
  }
}

onMounted(async () => {
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    await router.push('/user/login')
    return
  }
  await loadAccount()
  const goodsRes = await listPointGoods().catch(() => null)
  if (goodsRes?.data?.code === 0) {
    goodsList.value = goodsRes.data.data || []
  }
  await loadRecords()
})
</script>

<style scoped>
#pointCenterPage {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}

.panel {
  border-radius: 14px;
  background: var(--ai-card-surface, #fff);
  border: 1px solid var(--ai-card-border, #cfdae8);
  margin-bottom: 16px;
}

.panel-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ai-title, #2c3a4d);
}

.panel-sub {
  font-size: 12px;
  color: var(--ai-muted, #8b97a8);
}

.account-line {
  display: flex;
  gap: 28px;
  margin-bottom: 18px;
}

.account-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--ai-primary, #4a6fa5);
  font-variant-numeric: tabular-nums;
}

.account-label {
  font-size: 12px;
  color: var(--ai-muted, #8b97a8);
}

.sign-button {
  margin-bottom: 18px;
}

.calendar-week,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-week span {
  text-align: center;
  font-size: 11px;
  color: var(--ai-muted, #8b97a8);
  padding-bottom: 4px;
}

.day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--ai-text, #4a5a6e);
  background: color-mix(in srgb, var(--ai-surface-soft, #e6ecf4) 60%, transparent);
}

.day.is-blank {
  background: transparent;
}

.day.is-signed {
  background: color-mix(in srgb, var(--ai-primary, #4a6fa5) 18%, transparent);
  color: var(--ai-primary-strong, #3a5a8a);
  font-weight: 600;
}

.day.is-today {
  outline: 1px solid color-mix(in srgb, var(--ai-primary, #4a6fa5) 45%, transparent);
}

.goods {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ai-surface-soft, #e6ecf4) 55%, transparent);
}

.goods-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ai-title, #2c3a4d);
}

.goods-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-muted, #8b97a8);
}

.goods-side {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}

.goods-cost {
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-primary, #4a6fa5);
}

.goods-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--ai-muted, #8b97a8);
}

.panel--table {
  padding: 0;
}

.amount-plus {
  color: #4f9d69;
  font-weight: 600;
}

.amount-minus {
  color: #c0563a;
  font-weight: 600;
}
</style>
