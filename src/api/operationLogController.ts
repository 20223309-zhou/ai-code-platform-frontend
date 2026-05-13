// @ts-ignore
/* eslint-disable */
import request from '@/request'

export async function listOperationLog(
  body: API.LogQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSysOperationLog>('/sysOperationLog/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  })
}

export async function deleteOperationLog(
  body: API.LogDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/sysOperationLog/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  })
}
