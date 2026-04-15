export type GenerateImageApiThread = 'thread1' | 'thread2'
export type GenerateImageApiStyle = 'gemini-native' | 'openai-compatible'

export interface GenerateImageThreadConfig {
  selectedThread: GenerateImageApiThread
  providerName: string
  apiStyle: GenerateImageApiStyle
  apiKey: string
  endpointUrl: string
  modelName: string
}

export interface GenerateImageThreadAvailability {
  thread1: {
    available: boolean
    name: string
    description: string
  }
  thread2: {
    available: boolean
    name: string
    description: string
  }
}

export interface GenerateImageThreadEnv {
  [key: string]: string | undefined
  YUNWU_API_KEY_COPY?: string
  YUNWU_API_KEY_IMAGE?: string
  GENERATE_IMAGE_THREAD2_BASE_URL?: string
  GENERATE_IMAGE_THREAD2_API_KEY?: string
  GENERATE_IMAGE_THREAD2_MODEL_NAME?: string
}

export const GENERATE_IMAGE_THREAD1_API_URL =
  'https://yunwu.ai/v1beta/models/gemini-3.1-flash-image-preview:generateContent'
export const GENERATE_IMAGE_THREAD1_MODEL = 'gemini-3.1-flash-image-preview'
export const DEFAULT_GENERATE_IMAGE_THREAD2_BASE_URL = 'https://128api.cn/v1'
export const DEFAULT_GENERATE_IMAGE_THREAD2_MODEL = 'gemini-3.1-flash-image'

export function normalizeGenerateImageApiThread(
  thread?: string
): GenerateImageApiThread {
  return thread === 'thread2' ? 'thread2' : 'thread1'
}

export function resolveGenerateImageThread2ChatCompletionsUrl(
  baseUrl: string
): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')

  if (trimmed.endsWith('/chat/completions')) {
    return trimmed
  }

  if (trimmed.endsWith('/v1')) {
    return `${trimmed}/chat/completions`
  }

  return `${trimmed}/v1/chat/completions`
}

export function resolveGenerateImageThreadConfig(
  thread: string | undefined,
  env: GenerateImageThreadEnv = process.env
): GenerateImageThreadConfig {
  const selectedThread = normalizeGenerateImageApiThread(thread)

  if (selectedThread === 'thread2') {
    return {
      selectedThread,
      providerName: '128API 图片生成（线路2）',
      apiStyle: 'openai-compatible',
      apiKey: env.GENERATE_IMAGE_THREAD2_API_KEY || '',
      endpointUrl: resolveGenerateImageThread2ChatCompletionsUrl(
        env.GENERATE_IMAGE_THREAD2_BASE_URL ||
          DEFAULT_GENERATE_IMAGE_THREAD2_BASE_URL
      ),
      modelName:
        env.GENERATE_IMAGE_THREAD2_MODEL_NAME ||
        DEFAULT_GENERATE_IMAGE_THREAD2_MODEL,
    }
  }

  return {
    selectedThread: 'thread1',
    providerName: '云雾图片生成（线路1）',
    apiStyle: 'gemini-native',
    apiKey: env.YUNWU_API_KEY_IMAGE || '',
    endpointUrl: GENERATE_IMAGE_THREAD1_API_URL,
    modelName: GENERATE_IMAGE_THREAD1_MODEL,
  }
}

export function getGenerateImageThreadAvailability(
  env: GenerateImageThreadEnv = process.env
): GenerateImageThreadAvailability {
  return {
    thread1: {
      available: Boolean(env.YUNWU_API_KEY_COPY && env.YUNWU_API_KEY_IMAGE),
      name: '云雾图片生成',
      description: '默认线路，文案+图片均走云雾 Gemini 原生格式',
    },
    thread2: {
      available: Boolean(
        env.GENERATE_IMAGE_THREAD2_BASE_URL &&
          env.GENERATE_IMAGE_THREAD2_API_KEY
      ),
      name: '128API 图片生成',
      description: `备用线路，OpenAI 兼容格式（默认模型：${DEFAULT_GENERATE_IMAGE_THREAD2_MODEL}）`,
    },
  }
}
