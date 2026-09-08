<template>
  <div class="cp-wrap" :style="wrapStyle">
    <span v-if="showTotal" class="cp-total" :style="totalStyle">共 {{ total }} 个模板</span>

    <button
      type="button"
      class="cp-btn cp-nav"
      :style="prevBtnStyle"
      :disabled="current <= 1"
      aria-label="上一页"
      @click="goTo(current - 1)"
    >‹</button>

    <button
      v-for="p in pages"
      :key="p"
      type="button"
      class="cp-btn"
      :class="{ 'cp-active': p === current }"
      :style="p === current ? activeBtnStyle : btnStyle"
      @click="goTo(p)"
    >{{ p }}</button>

    <button
      type="button"
      class="cp-btn cp-nav"
      :style="nextBtnStyle"
      :disabled="current >= totalPages"
      aria-label="下一页"
      @click="goTo(current + 1)"
    >›</button>

    <select
      v-if="showSizeChanger"
      class="cp-select"
      :style="selectStyle"
      :value="pageSize"
      aria-label="每页条数"
      @change="onSizeChange"
    >
      <option v-for="n in sizeOptions" :key="n" :value="n">{{ n }} / page</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  current: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  showSizeChanger?: boolean
  showTotal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [12, 24, 48],
  showSizeChanger: true,
  showTotal: true,
})

const emit = defineEmits<{
  (e: 'update:current', val: number): void
  (e: 'update:pageSize', val: number): void
  (e: 'change', page: number, size: number): void
  (e: 'showSizeChange', current: number, size: number): void
}>()

// 所有元素外观完全用 inline style 强制（inline style 优先级最高，不可能被任何 CSS 覆盖）
const wrapStyle: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  minWidth: '520px',
  whiteSpace: 'nowrap',
  margin: '24px 0 0',
  fontFamily: 'inherit',
  visibility: 'visible',
  opacity: '1',
  // 强制独立合成层，修复浏览器 GPU 合成层 paint bug（与模板卡片同方案）
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
  willChange: 'transform',
  isolation: 'isolate',
}
const totalStyle: Record<string, string> = {
  color: '#3f4a60',
  fontSize: '13px',
  marginRight: '8px',
  lineHeight: '36px',
  visibility: 'visible',
  opacity: '1',
  display: 'inline',
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
}
const baseBtn: Record<string, string> = {
  minWidth: '36px',
  height: '36px',
  padding: '0 8px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  visibility: 'visible',
  opacity: '1',
  fontFamily: 'inherit',
  // 强制独立合成层
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
  willChange: 'transform',
}
const btnStyle: Record<string, string> = {
  ...baseBtn,
  border: '1px solid rgba(28,42,96,0.12)',
  background: '#ffffff',
  color: '#3f4a60',
  cursor: 'pointer',
}
const prevBtnStyle: Record<string, string> = {
  ...baseBtn,
  border: '1px solid rgba(28,42,96,0.12)',
  background: 'rgba(0,0,0,0.04)',
  color: 'rgba(0,0,0,0.25)',
  cursor: 'not-allowed',
  fontSize: '18px',
  fontWeight: '600',
}
const nextBtnStyle: Record<string, string> = {
  ...baseBtn,
  border: '1px solid rgba(28,42,96,0.12)',
  background: '#ffffff',
  color: '#3f4a60',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: '600',
}
const activeBtnStyle: Record<string, string> = {
  ...baseBtn,
  border: '1px solid rgba(61,107,255,0.4)',
  background: 'rgba(61,107,255,0.12)',
  color: '#3d6bff',
  cursor: 'pointer',
  fontWeight: '600',
}
const selectStyle: Record<string, string> = {
  marginLeft: '8px',
  height: '36px',
  padding: '0 28px 0 10px',
  border: '1px solid rgba(28,42,96,0.12)',
  borderRadius: '8px',
  background:
    "#ffffff url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233f4a60' stroke-width='2.5' stroke-linecap='round'><polyline points='6 9 12 15 18 9'/></svg>\") no-repeat right 8px center",
  backgroundSize: '12px',
  color: '#3f4a60',
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  visibility: 'visible',
  opacity: '1',
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
  willChange: 'transform',
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed<number[]>(() => {
  const total = totalPages.value
  const cur = Math.min(Math.max(1, props.current), total)
  const max = 5
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, start + max - 1)
  if (end - start < max - 1) {
    start = Math.max(1, end - max + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const sizeOptions = computed(() => props.pageSizeOptions)

function goTo(p: number) {
  if (p < 1 || p > totalPages.value || p === props.current) return
  emit('update:current', p)
  emit('change', p, props.pageSize)
}

function onSizeChange(ev: Event) {
  const newSize = Number((ev.target as HTMLSelectElement).value)
  emit('update:pageSize', newSize)
  emit('update:current', 1)
  emit('showSizeChange', 1, newSize)
}
</script>

<style scoped>
.cp-wrap {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 520px;
  white-space: nowrap;
  margin: 24px 0 0;
  font-family: inherit;
  color: #3f4a60;
  font-size: 14px;
  visibility: visible !important;
  opacity: 1 !important;
}
.cp-total {
  color: #3f4a60;
  font-size: 13px;
  margin-right: 8px;
  line-height: 36px;
  visibility: visible !important;
  opacity: 1 !important;
}
.cp-btn {
  visibility: visible !important;
  opacity: 1 !important;
  display: inline-flex !important;
  min-width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.cp-btn.cp-active {
  background: rgba(61, 107, 255, 0.12) !important;
  color: #3d6bff !important;
  font-weight: 600 !important;
  border-color: rgba(61, 107, 255, 0.4) !important;
}
.cp-nav {
  font-size: 18px;
  font-weight: 600;
}
.cp-select {
  visibility: visible !important;
  opacity: 1 !important;
  display: inline-block !important;
  margin-left: 8px;
}
</style>
