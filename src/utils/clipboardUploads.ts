export const collectPastedImageFiles = (event: ClipboardEvent) => {
  const clipboardItems = event.clipboardData?.items
  if (!clipboardItems) {
    return []
  }

  const files: File[] = []
  let imageIndex = 1

  for (const item of Array.from(clipboardItems)) {
    if (!item.type.startsWith('image/')) {
      continue
    }

    const blob = item.getAsFile()
    if (!blob) {
      continue
    }

    const extension = blob.type.split('/')[1] || 'png'
    const now = Date.now()
    const fileName = `pasted-image-${now}-${imageIndex}.${extension}`
    files.push(new File([blob], fileName, { type: blob.type, lastModified: now }))
    imageIndex += 1
  }

  return files
}
