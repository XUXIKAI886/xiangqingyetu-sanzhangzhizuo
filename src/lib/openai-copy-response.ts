export function extractCopyTextFromOpenAIResponse(openAIResponse: unknown): string {
  const choices = (
    openAIResponse as {
      choices?: Array<{ message?: { content?: unknown }; delta?: { content?: unknown } }>
    }
  )?.choices

  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('OpenAI 兼容响应中未找到文案内容')
  }

  for (const choice of choices) {
    const rawContent = choice?.message?.content ?? choice?.delta?.content

    if (typeof rawContent === 'string' && rawContent.trim()) {
      return rawContent
    }

    if (Array.isArray(rawContent)) {
      const text = rawContent
        .map((part) => {
          if (!part || typeof part !== 'object') {
            return ''
          }

          const value = (part as { text?: string }).text
          return typeof value === 'string' ? value : ''
        })
        .join('')
        .trim()

      if (text) {
        return text
      }
    }
  }

  throw new Error('OpenAI 兼容响应中未找到文案内容')
}
