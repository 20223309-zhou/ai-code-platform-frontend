const pendingAppAttachments = new Map<string, File[]>()

export const setPendingAppAttachments = (appId: string, files: File[]) => {
  if (files.length === 0) {
    pendingAppAttachments.delete(appId)
    return
  }

  pendingAppAttachments.set(appId, [...files])
}

export const takePendingAppAttachments = (appId: string) => {
  const files = pendingAppAttachments.get(appId) ?? []
  pendingAppAttachments.delete(appId)
  return files
}

export const clearPendingAppAttachments = (appId: string) => {
  pendingAppAttachments.delete(appId)
}
