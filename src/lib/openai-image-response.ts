export interface OpenAIImageData {
  base64: string
  mimeType: string
}

function extractFromDataUrl(dataUrl: string): OpenAIImageData | null {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (!match) {
    return null
  }

  return {
    mimeType: match[1],
    base64: match[2],
  }
}

function extractFromContentPart(part: unknown): OpenAIImageData | null {
  if (!part || typeof part !== 'object') {
    return null
  }

  const imageUrl = (part as { image_url?: { url?: string } }).image_url?.url
  if (typeof imageUrl === 'string' && imageUrl) {
    return extractFromDataUrl(imageUrl)
  }

  const text = (part as { text?: string }).text
  if (typeof text !== 'string' || !text) {
    return null
  }

  return extractFromText(text)
}

function extractFromText(text: string): OpenAIImageData | null {
  const dataUrlMatch = text.match(/data:(image\/[^;]+);base64,([A-Za-z0-9+/=]+)/)
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      base64: dataUrlMatch[2],
    }
  }

  const trimmed = text.trim()
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
    return {
      mimeType: 'image/png',
      base64: trimmed,
    }
  }

  return null
}

export function extractImageDataFromOpenAIResponse(
  openAIResponse: unknown
): OpenAIImageData {
  const dataItems = (openAIResponse as { data?: Array<{ b64_json?: string }> })
    ?.data

  if (Array.isArray(dataItems)) {
    for (const item of dataItems) {
      if (typeof item?.b64_json === 'string' && item.b64_json) {
        return {
          base64: item.b64_json,
          mimeType: 'image/png',
        }
      }
    }
  }

  const choices = (
    openAIResponse as {
      choices?: Array<{ message?: { content?: unknown } }>
    }
  )?.choices

  if (Array.isArray(choices)) {
    for (const choice of choices) {
      const content = choice?.message?.content

      if (Array.isArray(content)) {
        for (const part of content) {
          const extracted = extractFromContentPart(part)
          if (extracted) {
            return extracted
          }
        }
      } else if (typeof content === 'string') {
        const extracted = extractFromText(content)
        if (extracted) {
          return extracted
        }
      }
    }
  }

  throw new Error('OpenAI 兼容响应中未找到图片数据')
}
