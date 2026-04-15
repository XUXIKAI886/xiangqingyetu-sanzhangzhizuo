type GenerateImageApiThread = 'thread1' | 'thread2'

export interface GenerateCopyThreadEnv {
  [key: string]: string | undefined
  YUNWU_API_KEY_COPY?: string
  GENERATE_IMAGE_THREAD2_BASE_URL?: string
  GENERATE_IMAGE_THREAD2_API_KEY?: string
  GENERATE_COPY_THREAD2_MODEL_NAME?: string
}

export interface GenerateCopyThreadConfig {
  selectedThread: GenerateImageApiThread
  providerName: string
  apiStyle: 'gemini-native' | 'openai-compatible'
  apiKey: string
  endpointUrl: string
  modelName: string
}

export const GENERATE_COPY_THREAD1_API_URL =
  'https://yunwu.ai/v1beta/models/gemini-3-flash-preview:streamGenerateContent'
export const GENERATE_COPY_THREAD1_MODEL = 'gemini-3-flash-preview'
export const DEFAULT_GENERATE_COPY_THREAD2_MODEL = 'gemini-3-flash-preview'

function resolveGenerateCopyThread2ChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')

  if (trimmed.endsWith('/chat/completions')) {
    return trimmed
  }

  if (trimmed.endsWith('/v1')) {
    return `${trimmed}/chat/completions`
  }

  return `${trimmed}/v1/chat/completions`
}

export function normalizeGenerateCopyApiThread(
  thread?: string
): GenerateImageApiThread {
  return thread === 'thread2' ? 'thread2' : 'thread1'
}

export function resolveGenerateCopyThreadConfig(
  thread: string | undefined,
  env: GenerateCopyThreadEnv = process.env
): GenerateCopyThreadConfig {
  const selectedThread = normalizeGenerateCopyApiThread(thread)

  if (selectedThread === 'thread2') {
    return {
      selectedThread,
      providerName: '128API 文案生成（线路2）',
      apiStyle: 'openai-compatible',
      apiKey: env.GENERATE_IMAGE_THREAD2_API_KEY || '',
      endpointUrl: resolveGenerateCopyThread2ChatCompletionsUrl(
        env.GENERATE_IMAGE_THREAD2_BASE_URL || 'https://128api.cn/v1'
      ),
      modelName:
        env.GENERATE_COPY_THREAD2_MODEL_NAME ||
        DEFAULT_GENERATE_COPY_THREAD2_MODEL,
    }
  }

  return {
    selectedThread: 'thread1',
    providerName: '云雾文案生成（线路1）',
    apiStyle: 'gemini-native',
    apiKey: env.YUNWU_API_KEY_COPY || '',
    endpointUrl: GENERATE_COPY_THREAD1_API_URL,
    modelName: GENERATE_COPY_THREAD1_MODEL,
  }
}
