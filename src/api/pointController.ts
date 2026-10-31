import request from '@/request'

/**
 * 签到与积分接口。
 */

type ApiResult<T> = { code: number; data: T; message?: string }

export interface PointAccount {
  balance: number
  totalEarned: number
  signedToday: boolean
  continuousDays: number
  /** 本月已签到的日期（1-31） */
  monthSignedDays: number[]
  quota: number
}

export interface SignInResult {
  reward: number
  balance: number
  continuousDays: number
}

export interface PointGoods {
  id: string
  name: string
  description: string
  cost: number
  maxCount: number
}

export interface ExchangeResult {
  cost: number
  gainedQuota: number
  balance: number
  quota: number
}

export interface PointRecord {
  id: string
  type: string
  amount: number
  balanceAfter: number
  remark?: string
  createTime: string
}

export async function getPointAccount() {
  return request<ApiResult<PointAccount>>('/point/account', { method: 'GET' })
}

export async function signIn() {
  return request<ApiResult<SignInResult>>('/point/sign-in', { method: 'POST' })
}

export async function listPointGoods() {
  return request<ApiResult<PointGoods[]>>('/point/goods', { method: 'GET' })
}

export async function exchangeGoods(goodsId: string, count = 1) {
  return request<ApiResult<ExchangeResult>>('/point/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { goodsId, count },
  })
}

export async function pagePointRecords(params: { pageNum?: number; pageSize?: number }) {
  return request<ApiResult<{ records: PointRecord[]; totalRow: number }>>('/point/record', {
    method: 'GET',
    params,
  })
}
