export const CHAT_UPLOAD_ACCEPT = 'image/*,.txt,.md,.markdown,.csv'
export const CHAT_UPLOAD_MAX_SIZE_MB = 5
const CHAT_UPLOAD_MAX_SIZE_BYTES = CHAT_UPLOAD_MAX_SIZE_MB * 1024 * 1024
const TEXT_FILE_EXTENSIONS = ['.txt', '.md', '.markdown', '.csv']

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

const isTextLikeFile = (file: File) => {
  const lowerCaseName = file.name.toLowerCase()
  return (
    file.type.includes('text') ||
    TEXT_FILE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension))
  )
}

export const isSupportedChatUpload = (file: File) => {
  return file.type.startsWith('image/') || isTextLikeFile(file)
}

export const collectValidChatUploads = (selectedFiles: Iterable<File>, existingFiles: File[] = []) => {
  const nextFiles = [...existingFiles]
  const seen = new Set(existingFiles.map(getFileKey))
  const errors: string[] = []

  for (const file of selectedFiles) {
    if (!isSupportedChatUpload(file)) {
      errors.push(`不支持的文件类型：${file.name}`)
      continue
    }

    if (file.size > CHAT_UPLOAD_MAX_SIZE_BYTES) {
      errors.push(`文件超过 ${CHAT_UPLOAD_MAX_SIZE_MB}MB：${file.name}`)
      continue
    }

    const fileKey = getFileKey(file)
    if (seen.has(fileKey)) {
      continue
    }

    seen.add(fileKey)
    nextFiles.push(file)
  }

  return {
    files: nextFiles,
    errors,
  }
}

export const summarizeUploadedFiles = (files: File[]) => {
  if (files.length === 0) {
    return ''
  }

  const imageCount = files.filter((file) => file.type.startsWith('image/')).length
  const textCount = files.length - imageCount
  const parts: string[] = []

  if (imageCount > 0) {
    parts.push(`${imageCount} 张图片`)
  }

  if (textCount > 0) {
    parts.push(`${textCount} 个文本文件`)
  }

  return parts.join('、')
}
