interface CopyResponse {
  title: string
  content: string
  prompt: string
}

interface ResponsePart {
  text?: string
  thought?: boolean
}

interface ResponseCandidate {
  content?: {
    parts?: ResponsePart[]
  }
}

interface ProviderResponse {
  candidates?: ResponseCandidate[]
}

const TITLE_LABEL_PATTERN = /^(核心标题|主标题|标题|副标题|视觉卖点)$/u

function extractTextFromObject(data: ProviderResponse): string {
  return (data.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .filter((part) => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text ?? '')
    .join('')
}

function parseAsNdjson(responseText: string): ProviderResponse[] {
  return responseText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as ProviderResponse]
      } catch {
        return []
      }
    })
}

function extractJsonBlock(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('响应文本中未找到 JSON 内容')
  }

  return jsonMatch[0]
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim()
}

function cleanMarkdownText(text: string): string {
  return normalizeText(text)
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3,}[\s\S]*?`{3,}/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractPromptSection(text: string): string | null {
  const match = normalizeText(text).match(
    /(?:^|\n)(?:#{1,6}\s*)?(?:AI生图提示词|生图提示词|图片生成提示词|AI Image Prompt|Image Prompt|Prompt)\s*(?:[:：]\s*)?\n?([\s\S]+)/i
  )

  if (!match?.[1]) {
    return null
  }

  return cleanMarkdownText(match[1])
}

function extractTitleFromText(text: string): string | null {
  const normalized = normalizeText(text)
  const tableMatch = normalized.match(
    /\|\s*\*{0,2}(?:核心标题|主标题|标题)\*{0,2}\s*\|\s*\*{0,2}([^|\n*]{2,40})\*{0,2}\s*\|/u
  )
  if (tableMatch?.[1]) {
    return tableMatch[1].trim()
  }

  const titledBlockMatch = normalized.match(
    /(?:核心标题|主标题|标题)[^\n]*\n+\s*\*{1,2}([^*\n]{2,40})\*{1,2}/u
  )
  if (titledBlockMatch?.[1]) {
    return titledBlockMatch[1].trim()
  }

  const inlineTitleMatch = normalized.match(
    /(?:核心标题|主标题|标题)[^：:\n]*[：:]\s*\*{0,2}([^*\n]{2,40})\*{0,2}/u
  )
  if (inlineTitleMatch?.[1]) {
    return inlineTitleMatch[1].trim()
  }

  const boldMatches = Array.from(normalized.matchAll(/\*\*([^*\n]{2,40})\*\*/gu))
    .map((match) => match[1].trim())
    .filter(
      (value) =>
        value.length >= 4 &&
        value.length <= 30 &&
        !TITLE_LABEL_PATTERN.test(value)
    )

  return boldMatches[0] || null
}

function buildFallbackPrompt(title: string, content: string): string {
  return cleanMarkdownText(`9:16竖版电商详情页海报，突出主题「${title}」。

请基于以下文案生成适合详情页展示的画面：${content}

要求突出产品主体、核心卖点、版式层级、暖光氛围与食欲感，适合外卖详情页。`)
}

function parseCopyMarkdownText(text: string): CopyResponse {
  const normalized = normalizeText(text)
  const prompt = extractPromptSection(normalized)
  const contentSource = prompt
    ? normalized.replace(
        /(?:^|\n)(?:#{1,6}\s*)?(?:AI生图提示词|生图提示词|图片生成提示词|AI Image Prompt|Image Prompt|Prompt)\s*(?:[:：]\s*)?[\s\S]*$/i,
        ''
      )
    : normalized
  const title = extractTitleFromText(contentSource)
  const content = cleanMarkdownText(contentSource)

  if (!title || !content) {
    throw new Error('响应文本中未找到可用的 Markdown 文案结构')
  }

  return {
    title,
    content,
    prompt: prompt || buildFallbackPrompt(title, content),
  }
}

export function parseCopyJsonText(text: string): CopyResponse {
  return JSON.parse(extractJsonBlock(text)) as CopyResponse
}

export function parseCopyText(text: string): CopyResponse {
  try {
    return parseCopyJsonText(text)
  } catch {
    return parseCopyMarkdownText(text)
  }
}

export function parseCopyResponseText(responseText: string): CopyResponse {
  const parsedObjects: ProviderResponse[] = []

  try {
    parsedObjects.push(JSON.parse(responseText) as ProviderResponse)
  } catch {
    parsedObjects.push(...parseAsNdjson(responseText))
  }

  if (parsedObjects.length === 0) {
    throw new Error('供应商响应不是有效的 JSON 或 NDJSON')
  }

  const fullText = parsedObjects.map(extractTextFromObject).join('')
  if (!fullText) {
    throw new Error('供应商响应中未提取到文本内容')
  }

  return parseCopyText(fullText)
}
