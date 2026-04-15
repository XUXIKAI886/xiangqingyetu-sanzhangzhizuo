interface ApiErrorPayload {
  error?: string
  message?: string
  detail?: string
  raw?: string
}

export function buildApiErrorMessage(
  fallbackMessage: string,
  payload: unknown
): string {
  if (payload && typeof payload === 'object') {
    const data = payload as ApiErrorPayload
    const primaryMessage =
      (typeof data.error === 'string' && data.error.trim()) ||
      (typeof data.message === 'string' && data.message.trim()) ||
      fallbackMessage

    const sections = [primaryMessage]

    if (typeof data.detail === 'string' && data.detail.trim()) {
      sections.push(`详情：${data.detail.trim()}`)
    }

    if (typeof data.raw === 'string' && data.raw.trim()) {
      sections.push(`原始响应：${data.raw.trim()}`)
    }

    return sections.join('\n\n')
  }

  if (typeof payload === 'string' && payload.trim()) {
    return `${fallbackMessage}\n\n详情：${payload.trim()}`
  }

  return fallbackMessage
}

export async function readApiErrorMessage(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const responseText = await response.text()
    if (!responseText.trim()) {
      return fallbackMessage
    }

    try {
      return buildApiErrorMessage(
        fallbackMessage,
        JSON.parse(responseText) as unknown
      )
    } catch {
      return buildApiErrorMessage(fallbackMessage, responseText)
    }
  } catch {
    return fallbackMessage
  }
}
