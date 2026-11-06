<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AppPlanItem } from '@/api/appPlanController'

const props = defineProps<{
  open: boolean
  plans: AppPlanItem[]
  loading?: boolean
  /** 弹窗主标题，默认「先定个方向」；换方案时传「换个方向」 */
  title?: string
  /** 标题下的一句话说明，不传则用默认文案 */
  description?: string
  /** 隐藏「跳过，直接生成」—— 换方案场景里"跳过"没有意义（等于取消） */
  hideSkip?: boolean
  /** 确认按钮文案，默认「开始生成」 */
  confirmText?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', payload: { plan: AppPlanItem | null; custom: string }): void
  (e: 'skip'): void
  (e: 'cancel'): void
}>()

const selectedId = ref('')
const custom = ref('')

// 每次打开时重置：默认选中推荐方案（没有则第一个），自定义输入清空
watch(
  () => props.open,
  (open) => {
    if (!open) return
    const recommended = props.plans.find((p) => p.recommended)
    selectedId.value = recommended?.id || props.plans[0]?.id || ''
    custom.value = ''
  },
)

const selectedPlan = computed(
  () => props.plans.find((p) => p.id === selectedId.value) || null,
)

const canConfirm = computed(
  () => Boolean(selectedPlan.value) || custom.value.trim().length > 0,
)

const dialogTitle = computed(() => props.title || '先定个方向')
const dialogDescription = computed(
  () =>
    props.description ||
    `AI 准备了 ${props.plans.length} 种布局思路，选一个再开始；也可以直接用自己的描述。`,
)
const okText = computed(() => props.confirmText || '开始生成')

const pick = (id: string) => {
  selectedId.value = id
  // 选卡片时清掉自定义，避免"到底按哪个生成"的歧义
  custom.value = ''
}

const onCustomInput = () => {
  if (custom.value.trim()) selectedId.value = ''
}

const confirm = () => {
  if (!canConfirm.value) return
  const text = custom.value.trim()
  emit('confirm', { plan: text ? null : selectedPlan.value, custom: text })
}
</script>

<template>
  <a-modal
    :open="open"
    :footer="null"
    :width="760"
    centered
    :mask-closable="false"
    @cancel="emit('cancel')"
  >
    <div class="plan-choice">
      <header class="plan-head">
        <h3>{{ dialogTitle }}</h3>
        <p>{{ dialogDescription }}</p>
      </header>

      <div class="plan-grid">
        <button
          v-for="plan in plans"
          :key="plan.id"
          type="button"
          class="plan-card"
          :class="{ 'is-active': plan.id === selectedId }"
          @click="pick(plan.id)"
        >
          <div class="plan-card-top">
            <span class="plan-tag">{{ plan.id }}</span>
            <span v-if="plan.recommended" class="plan-badge">推荐</span>
          </div>
          <h4 class="plan-title">{{ plan.title }}</h4>
          <p class="plan-style">{{ plan.style }}</p>
          <p class="plan-layout">{{ plan.layout }}</p>
          <p class="plan-desc">{{ plan.desc }}</p>
          <div v-if="plan.tags?.length" class="plan-tags">
            <span v-for="tag in plan.tags" :key="tag" class="plan-chip">{{ tag }}</span>
          </div>
        </button>
      </div>

      <div class="plan-custom">
        <label>或者，用自己的话描述想要的样子</label>
        <a-textarea
          v-model:value="custom"
          :rows="2"
          :maxlength="300"
          placeholder="例如：左侧固定导航，内容区用卡片瀑布流，整体深色；不要圆角"
          @input="onCustomInput"
        />
      </div>

      <footer class="plan-actions">
        <button v-if="!hideSkip" type="button" class="btn-ghost" @click="emit('skip')">
          跳过，直接生成
        </button>
        <span v-else class="plan-actions-hint">换方案会清空当前已生成的代码</span>
        <div class="plan-actions-right">
          <a-button @click="emit('cancel')">取消</a-button>
          <a-button type="primary" :disabled="!canConfirm" :loading="loading" @click="confirm">
            {{ okText }}
          </a-button>
        </div>
      </footer>
    </div>
  </a-modal>
</template>

<style scoped>
.plan-choice {
  padding: 4px 2px;
}

.plan-head h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2430;
}

.plan-head p {
  margin: 0 0 18px;
  font-size: 13px;
  color: #6b7280;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.plan-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 16px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  border-radius: 12px;
  background: var(--ai-surface);
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
}

.plan-card:hover {
  border-color: rgba(79, 124, 255, 0.45);
  transform: translateY(-1px);
}

.plan-card.is-active {
  border-color: #4f7cff;
  box-shadow: 0 0 0 2px rgba(79, 124, 255, 0.14);
}

.plan-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.plan-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(79, 124, 255, 0.1);
  color: #4f7cff;
  font-size: 12px;
  font-weight: 600;
}

.plan-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(79, 124, 255, 0.12);
  color: #4f7cff;
}

.plan-title {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2430;
}

.plan-style {
  margin: 0 0 10px;
  font-size: 12px;
  color: #8a8f9c;
}

.plan-layout {
  margin: 0 0 8px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #4b5563;
}

.plan-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #8a8f9c;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.plan-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(31, 36, 48, 0.05);
  color: #6b7280;
}

.plan-custom {
  margin-top: 18px;
}

.plan-custom label {
  display: block;
  margin-bottom: 6px;
  font-size: 12.5px;
  color: #6b7280;
}

.plan-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.plan-actions-right {
  display: flex;
  gap: 10px;
}

.btn-ghost {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

.btn-ghost:hover {
  color: #4f7cff;
}

.plan-actions-hint {
  font-size: 12.5px;
  color: #b45309;
}
</style>
