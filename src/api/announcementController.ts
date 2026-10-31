import request from '@/request'

/**
 * 公告接口。
 *
 * 单独成文件而不是塞进 appController.ts —— 那个文件是接口生成器产出的，
 * 手写内容下次生成会被覆盖。
 */

/** 统一响应包装：后端 BaseResponse 的 data 之外还带 code / message */
type ApiResult<T> = { code: number; data: T; message?: string }

export interface AnnouncementVO {
  id: number | string
  title: string
  /** Markdown 正文 */
  content: string
  /** INFO / WARNING / SUCCESS */
  level: string
  topFlag?: number
  publishTime?: string
}

export interface AnnouncementEntity extends AnnouncementVO {
  status: number
  expireTime?: string
  createUserId?: number
  createTime?: string
  updateTime?: string
}

export interface AnnouncementSaveRequest {
  id?: number | string
  title: string
  content: string
  level?: string
  topFlag?: number
  publishTime?: string
  expireTime?: string
  publishNow?: boolean
}

/** 用户端：当前可见公告（已发布 + 已到时间 + 未过期） */
export async function listVisibleAnnouncements() {
  return request<ApiResult<AnnouncementVO[]>>('/announcement/visible', {
    method: 'GET',
  })
}

/** 管理端：分页查询 */
export async function pageAnnouncements(params: {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: number
}) {
  return request<ApiResult<{ records: AnnouncementEntity[]; totalRow: number }>>(
    '/announcement/admin/list',
    {
      method: 'GET',
      params,
    },
  )
}

/** 管理端：新增或编辑（id 为空即新增） */
export async function saveAnnouncement(data: AnnouncementSaveRequest) {
  return request<ApiResult<number | string>>('/announcement/admin/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  })
}

export async function publishAnnouncement(id: number | string) {
  return request<ApiResult<boolean>>(`/announcement/admin/publish/${id}`, {
    method: 'POST',
  })
}

export async function offlineAnnouncement(id: number | string) {
  return request<ApiResult<boolean>>(`/announcement/admin/offline/${id}`, {
    method: 'POST',
  })
}

export async function deleteAnnouncement(id: number | string) {
  return request<ApiResult<boolean>>(`/announcement/admin/delete/${id}`, {
    method: 'POST',
  })
}
