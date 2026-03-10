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

  return JSON.parse(extractJsonBlock(fullText)) as CopyResponse
}
